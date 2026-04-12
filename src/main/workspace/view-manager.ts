// ============================================================
// ViewManager — WebContentsView 生命周期管理
// ============================================================
// 创建/显示/隐藏/销毁 WebContentsView。
// 恢复策略：metadata 恢复 + lazy view recreate。
// OAuth 弹窗：临时子 BrowserWindow + 可共享认证 partition。

import { BrowserWindow, WebContentsView, session, shell } from "electron";
import type {
  BrowserWindowConstructorOptions,
  Session,
  WebContents,
  WindowOpenHandlerResponse,
} from "electron";
import type {
  Rectangle,
  Application,
  PersistedInstance,
} from "../../shared/types";
import {
  EMBEDDED_WEB_ACCEPT_LANGUAGES,
  getAppPartition,
  getEmbeddedWebUserAgent,
} from "../../shared/app-runtime";
import { appRegistry } from "../catalog/app-registry";
import { localStore } from "../persistence/local-store";
import { eventLogger } from "../runtime/event-logger";
import { NavigationPolicy } from "../runtime/navigation-policy";
import { instanceStore } from "./instance-store";

type ViewReleasePolicy = "memorySaver" | "balanced" | "performance";

interface ReleasePolicyConfig {
  releaseAfterHiddenMs: number | null;
  keepAliveRecentCount: number;
}

const VIEW_RELEASE_POLICIES: Record<ViewReleasePolicy, ReleasePolicyConfig> = {
  memorySaver: {
    releaseAfterHiddenMs: 5 * 60 * 1000,
    keepAliveRecentCount: 3,
  },
  balanced: {
    releaseAfterHiddenMs: 20 * 60 * 1000,
    keepAliveRecentCount: 20,
  },
  performance: {
    releaseAfterHiddenMs: null,
    keepAliveRecentCount: Number.MAX_SAFE_INTEGER,
  },
};

class ViewManager {
  private views: Map<string, WebContentsView> = new Map();
  private releaseTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private mainWindow: BrowserWindow | null = null;
  private configuredPartitions: Set<string> = new Set();
  private isShuttingDown = false;
  /** 当前 WebContentsView 的可用布局区域 */
  private contentBounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  markShuttingDown(): void {
    this.isShuttingDown = true;
  }

  setContentBounds(bounds: Rectangle): void {
    this.contentBounds = bounds;
    // 主窗口尺寸变化时，只更新当前可见 view 的布局。
    // 隐藏态 view 会被移出可视区域，不需要每次 resize 都一起重排。
    const activeId = instanceStore.getWorkspaceState().activeInstanceId;
    if (activeId) {
      const view = this.views.get(activeId);
      if (view) {
        view.setBounds(this.contentBounds);
        instanceStore.setViewBounds(activeId, this.contentBounds);
      }
    }
  }

  /** 创建 WebContentsView 并加载 URL */
  create(
    instance: PersistedInstance,
    app: Application,
    options?: { visible?: boolean },
  ): WebContentsView {
    if (!this.mainWindow) throw new Error("MainWindow not set");
    const instanceId = instance.id;
    const isVisible = options?.visible ?? true;
    this.cancelRelease(instanceId);
    const partition = getAppPartition();
    const sessionRef = this.configureSession();

    const view = new WebContentsView({
      webPreferences: {
        partition,
        session: sessionRef,
        contextIsolation: true,
        sandbox: true,
      },
    });

    this.applyUserAgent(view.webContents);

    // 绑定导航策略
    const policy = new NavigationPolicy(app);
    policy.attach(view);

    // 处理 OAuth 弹窗
    this.setupPopupHandler(view, app, policy);

    // 监听页面标题变更
    view.webContents.on("page-title-updated", (_event, title) => {
      instanceStore.onPageTitleUpdated(instanceId, title);
    });
    view.webContents.on("did-navigate", (_event, url) => {
      instanceStore.onPageUrlUpdated(instanceId, url);
    });
    view.webContents.on("did-navigate-in-page", (_event, url) => {
      instanceStore.onPageUrlUpdated(instanceId, url);
    });

    // 监听加载状态
    view.webContents.on("did-start-loading", () => {
      instanceStore.updateRuntimeStatus(instanceId, "loading");
    });
    view.webContents.on("did-finish-load", () => {
      instanceStore.updateRuntimeStatus(instanceId, "ready");
      this.syncHiddenViewActivity(instanceId, view);
    });
    view.webContents.on(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        instanceStore.updateRuntimeStatus(
          instanceId,
          "error",
          errorDescription,
        );
        eventLogger.log("load_failed", {
          appId: app.id,
          instanceId,
          errorCode,
          errorDescription,
        });
        this.syncHiddenViewActivity(instanceId, view);
      },
    );

    // 监控底层渲染器因内存不足等原因在后台被系统杀死
    view.webContents.on("render-process-gone", (_event, details) => {
      this.handleUnexpectedViewLoss(
        instanceId,
        view,
        app,
        `render-process-gone:${details.reason}`,
      );
    });
    view.webContents.on("destroyed", () => {
      this.handleUnexpectedViewLoss(instanceId, view, app, "webcontents-destroyed");
    });

    // 记录 webContentsId
    instanceStore.setWebContentsId(instanceId, view.webContents.id);

    view.setBounds(this.contentBounds);
    if (isVisible) {
      // 可见标签仍沿用“先挂载再加载”的策略，避免激活页首帧抖动。
      this.mainWindow.contentView.addChildView(view);
    }
    this.applyViewActivity(instanceId, view, isVisible);
    view.webContents.loadURL(instance.lastUrl || app.startUrl);

    this.views.set(instanceId, view);
    return view;
  }

  /** 显示指定实例的 View，传 null 隐藏所有 */
  show(instanceId: string | null): void {
    if (!this.mainWindow) return;
    if (instanceId !== null) {
      const activeView = this.ensureView(instanceId);
      if (!activeView) {
        return;
      }
    }

    // 隐藏所有其他 View
    for (const [id, view] of this.views) {
      if (instanceId !== null && id === instanceId) {
        if (!this.isViewUsable(view)) {
          continue;
        }
        try {
          this.mainWindow.contentView.addChildView(view);
        } catch {
          // 忽略重复添加可能抛出的错误
        }
        view.setBounds(this.contentBounds);
        this.applyViewActivity(id, view, true);
      } else {
        try {
          this.mainWindow.contentView.removeChildView(view);
        } catch {
          // 忽略已经移除可能抛出的错误
        }
        this.applyViewActivity(id, view, false);
      }
    }
  }

  /** 销毁 View */
  destroy(instanceId: string): void {
    const view = this.views.get(instanceId);
    if (!view) return;
    this.disposeView(instanceId, view, { syncCurrentUrl: true });
  }

  /** 检查 View 是否已创建 */
  hasView(instanceId: string): boolean {
    return this.getReusableView(instanceId) !== null;
  }

  prewarm(instanceId: string): void {
    const activeId = instanceStore.getWorkspaceState().activeInstanceId;
    const reusableView = this.getReusableView(instanceId);

    if (reusableView) {
      if (instanceId === activeId) {
        this.show(instanceId);
      } else {
        this.applyViewActivity(instanceId, reusableView, false);
      }
      return;
    }

    const instance = instanceStore.getInstance(instanceId);
    const app = instance ? appRegistry.get(instance.applicationId) : undefined;
    if (!instance || !app) {
      return;
    }

    this.create(instance, app, { visible: instanceId === activeId });
  }

  reload(instanceId: string): void {
    const view = this.ensureView(instanceId);
    if (!view || !this.isViewUsable(view)) {
      return;
    }

    view.webContents.reload();
  }

  /** 销毁所有 View */
  destroyAll(): void {
    for (const id of this.views.keys()) {
      this.destroy(id);
    }
  }

  syncAllCurrentUrls(): void {
    for (const [instanceId, view] of this.views) {
      this.syncCurrentUrl(instanceId, view);
    }
  }

  refreshReleasePolicy(): void {
    const activeId = instanceStore.getWorkspaceState().activeInstanceId;
    for (const [instanceId] of this.views) {
      if (instanceId === activeId) {
        this.cancelRelease(instanceId);
        continue;
      }
      this.scheduleRelease(instanceId);
    }
  }

  release(instanceId: string): void {
    const view = this.views.get(instanceId);
    if (!view) return;

    // release 和 destroy 的区别：
    // destroy 用于用户主动关闭实例；
    // release 用于长时间未激活后的资源回收，实例 metadata 仍然保留。
    this.disposeView(instanceId, view, { syncCurrentUrl: true });
    instanceStore.markReleased(instanceId);
  }

  releaseAll(): void {
    for (const [instanceId, view] of Array.from(this.views.entries())) {
      this.disposeView(instanceId, view, { syncCurrentUrl: true });
      instanceStore.markReleased(instanceId);
    }
  }

  // ─── OAuth 弹窗处理 ────────────────────────────────────

  private setupPopupHandler(
    view: WebContentsView,
    app: Application,
    policy: NavigationPolicy,
  ): void {
    view.webContents.setWindowOpenHandler(({ url }) => {
      let hostname: string;
      try {
        hostname = new URL(url).hostname.toLowerCase();
      } catch {
        return { action: "deny" as const };
      }

      // OAuth 弹窗 → 创建临时子窗口
      if (policy.isAllowedPopup(hostname)) {
        return this.openOAuthPopup();
      }

      // 站内域名 → 在当前 View 内导航
      if (policy.isAllowedNavigation(hostname)) {
        view.webContents.loadURL(url);
        return { action: "deny" as const };
      }

      // 外部 → 系统浏览器
      shell.openExternal(url);
      return { action: "deny" as const };
    });
  }

  private openOAuthPopup(): WindowOpenHandlerResponse {
    if (!this.mainWindow) {
      return { action: "deny" };
    }
    const partition = getAppPartition();
    const sessionRef = this.configureSession();
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        width: 500,
        height: 700,
        parent: this.mainWindow,
        modal: false,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
          partition,
          session: sessionRef,
          contextIsolation: true,
          sandbox: true,
        },
      },
      createWindow: (options: BrowserWindowConstructorOptions) => {
        const popup = new BrowserWindow({
          ...options,
          parent: this.mainWindow ?? undefined,
          modal: false,
          autoHideMenuBar: true,
          show: false,
          webPreferences: {
            ...options.webPreferences,
            partition,
            session: sessionRef,
            contextIsolation: true,
            sandbox: true,
          },
        });

        this.applyUserAgent(popup.webContents);
        popup.once("ready-to-show", () => popup.show());
        return popup.webContents;
      },
    };
  }

  private configureSession(): Session {
    const partition = getAppPartition();
    const userAgent = getEmbeddedWebUserAgent();
    const sessionRef = session.fromPartition(partition);
    if (this.configuredPartitions.has(partition)) {
      return sessionRef;
    }

    // Session 级别统一设置 UA / Accept-Language，
    // 这样同一 partition 下的后续请求会保持一致身份特征。
    sessionRef.setUserAgent(
      userAgent,
      EMBEDDED_WEB_ACCEPT_LANGUAGES,
    );

    sessionRef.webRequest.onBeforeSendHeaders((details, callback) => {
      callback({
        requestHeaders: {
          ...details.requestHeaders,
          "User-Agent": userAgent,
          "Accept-Language": EMBEDDED_WEB_ACCEPT_LANGUAGES,
        },
      });
    });

    this.configuredPartitions.add(partition);
    return sessionRef;
  }

  private applyUserAgent(webContents: WebContents): void {
    webContents.setUserAgent(getEmbeddedWebUserAgent());
  }

  private applyViewActivity(
    instanceId: string,
    view: WebContentsView,
    isActive: boolean,
  ): void {
    if (isActive) {
      this.cancelRelease(instanceId);
    }
    view.webContents.setAudioMuted(!isActive);
    const isLoading = instanceStore.getRuntimeState(instanceId)?.status === "loading";
    // 隐藏但仍在首轮加载的标签先不要节流，避免用户快速切换时网页初始化被挂起。
    view.webContents.setBackgroundThrottling(!isActive && !isLoading);
    // hostingState 描述的是“资源占用状态”，不是业务成功失败状态。
    // 因此它与 status(loading/ready/error) 分开维护。
    instanceStore.setHostingState(
      instanceId,
      isActive ? "active" : "throttled",
    );
    instanceStore.setViewBounds(
      instanceId,
      isActive ? this.contentBounds : null,
    );
    if (!isActive) {
      this.scheduleRelease(instanceId);
    }
  }

  private scheduleRelease(instanceId: string): void {
    this.cancelRelease(instanceId);
    const policy = this.getReleasePolicy();
    if (
      policy.releaseAfterHiddenMs === null ||
      this.shouldKeepAlive(instanceId, policy.keepAliveRecentCount)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const activeId = instanceStore.getWorkspaceState().activeInstanceId;
      if (activeId === instanceId) return;
      this.release(instanceId);
    }, policy.releaseAfterHiddenMs);
    this.releaseTimers.set(instanceId, timer);
  }

  private syncHiddenViewActivity(
    instanceId: string,
    view: WebContentsView,
  ): void {
    const activeId = instanceStore.getWorkspaceState().activeInstanceId;
    if (activeId === instanceId || !this.isViewUsable(view)) {
      return;
    }

    this.applyViewActivity(instanceId, view, false);
  }

  private cancelRelease(instanceId: string): void {
    const timer = this.releaseTimers.get(instanceId);
    if (!timer) return;
    clearTimeout(timer);
    this.releaseTimers.delete(instanceId);
  }

  private syncCurrentUrl(instanceId: string, view: WebContentsView): void {
    if (!this.isViewUsable(view)) return;
    const webContents = this.getWebContents(view);
    if (!webContents) return;
    const currentUrl = webContents.getURL();
    if (!currentUrl || currentUrl.startsWith("about:blank")) return;
    instanceStore.onPageUrlUpdated(instanceId, currentUrl);
  }

  private isViewUsable(view: WebContentsView): boolean {
    const webContents = this.getWebContents(view);
    return webContents !== null && !webContents.isDestroyed();
  }

  private getWebContents(view: WebContentsView): WebContents | null {
    const candidate = (view as { webContents?: WebContents }).webContents;
    return candidate ?? null;
  }

  private getReusableView(instanceId: string): WebContentsView | null {
    const view = this.views.get(instanceId);
    if (!view) {
      return null;
    }
    if (this.isViewUsable(view)) {
      return view;
    }

    this.disposeView(instanceId, view, { syncCurrentUrl: false });
    instanceStore.markReleased(instanceId);
    return null;
  }

  private ensureView(instanceId: string): WebContentsView | null {
    const reusableView = this.getReusableView(instanceId);
    if (reusableView) {
      return reusableView;
    }

    const instance = instanceStore.getInstance(instanceId);
    const app = instance ? appRegistry.get(instance.applicationId) : undefined;
    if (!instance || !app) {
      return null;
    }

    return this.create(instance, app);
  }

  private disposeView(
    instanceId: string,
    view: WebContentsView,
    options: { syncCurrentUrl: boolean },
  ): void {
    this.cancelRelease(instanceId);

    if (options.syncCurrentUrl) {
      this.syncCurrentUrl(instanceId, view);
    }

    if (this.mainWindow) {
      try {
        this.mainWindow.contentView.removeChildView(view);
      } catch {
        // view 可能已经不在当前窗口层级，忽略即可
      }
    }

    this.views.delete(instanceId);
    instanceStore.setViewBounds(instanceId, null);
    instanceStore.setWebContentsId(instanceId, null);

    const webContents = this.getWebContents(view);
    if (webContents && !webContents.isDestroyed()) {
      try {
        webContents.close();
      } catch {
        // 已损坏的 WebContents 有时无法正常关闭，移除引用即可
      }
    }
  }

  private handleUnexpectedViewLoss(
    instanceId: string,
    view: WebContentsView,
    app: Application,
    reason: string,
  ): void {
    if (this.isShuttingDown) {
      return;
    }

    if (this.views.get(instanceId) !== view) {
      return;
    }

    eventLogger.log("load_failed", {
      appId: app.id,
      instanceId,
      errorCode: 1,
      errorDescription: `渲染进程丢失: ${reason}`,
    });

    this.disposeView(instanceId, view, { syncCurrentUrl: true });
    instanceStore.markReleased(instanceId);

    const activeId = instanceStore.getWorkspaceState().activeInstanceId;
    if (activeId === instanceId) {
      this.ensureView(instanceId);
      this.show(instanceId);
      return;
    }

    instanceStore.updateRuntimeStatus(
      instanceId,
      "idle",
      `[RECOVERABLE_VIEW_LOSS] ${reason}`,
    );
  }

  private getReleasePolicy(): ReleasePolicyConfig {
    const preference =
      localStore.getPreferences().viewReleasePolicy ?? "balanced";
    return VIEW_RELEASE_POLICIES[preference];
  }

  private shouldKeepAlive(
    instanceId: string,
    keepAliveRecentCount: number,
  ): boolean {
    if (keepAliveRecentCount <= 0) return false;

    const activeId = instanceStore.getWorkspaceState().activeInstanceId;
    if (activeId === instanceId) return true;

    const instances = instanceStore
      .getWorkspaceState()
      .instances.slice()
      .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);

    return instances
      .slice(0, keepAliveRecentCount)
      .some((instance) => instance.id === instanceId);
  }
}

export const viewManager = new ViewManager();
