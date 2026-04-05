// ============================================================
// ViewManager — WebContentsView 生命周期管理
// ============================================================
// 创建/显示/隐藏/销毁 WebContentsView。
// 恢复策略：metadata 恢复 + lazy view recreate。
// OAuth 弹窗：临时子 BrowserWindow + 可共享认证 partition。

import { BrowserWindow, WebContentsView, session, shell } from "electron";
import type { Session, WebContents } from "electron";
import type {
  Rectangle,
  Application,
  PersistedInstance,
} from "../../shared/types";
import {
  getAppPartition,
  SHARED_ACCEPT_LANGUAGES,
  SHARED_CHROME_USER_AGENT,
  SHARED_EMBEDDED_WEB_PARTITION,
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
  /** 当前 WebContentsView 的可用布局区域 */
  private contentBounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
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
  create(instance: PersistedInstance, app: Application): WebContentsView {
    if (!this.mainWindow) throw new Error("MainWindow not set");
    const instanceId = instance.id;
    this.cancelRelease(instanceId);
    const partition = getAppPartition(app);
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

    // 添加到窗口并加载
    this.mainWindow.contentView.addChildView(view);
    view.setBounds(this.contentBounds);
    // 视图先挂进窗口，再 loadURL。
    // 这样后续 did-start-loading / did-finish-load 生命周期与可见区域是一致的。
    this.applyViewActivity(instanceId, view, true);
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
        this.openOAuthPopup(url, app, policy);
        return { action: "deny" as const };
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

  private openOAuthPopup(
    url: string,
    app: Application,
    policy: NavigationPolicy,
  ): void {
    if (!this.mainWindow) return;
    const partition = getAppPartition(app);
    const sessionRef = this.configureSession();

    const popup = new BrowserWindow({
      width: 500,
      height: 700,
      parent: this.mainWindow,
      modal: false,
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        partition, // 共享 session，OAuth 成功后 Cookie 自动复用到同 auth group
        session: sessionRef,
        contextIsolation: true,
        sandbox: true,
      },
    });

    this.applyUserAgent(popup.webContents);
    popup.once("ready-to-show", () => popup.show());

    popup.loadURL(url);

    // 检测 OAuth 完成：只有真正跳回目标站点时才关闭。
    // Google 自身的 accounts/myaccount 中间页仍然保留弹窗，避免“点下一步就消失”。
    popup.webContents.on("will-navigate", (_event, navUrl) => {
      try {
        const navHost = new URL(navUrl).hostname.toLowerCase();
        if (this.shouldCloseOAuthPopup(navHost, policy)) {
          popup.close();
        }
      } catch {
        // ignore invalid URLs
      }
    });
  }

  private configureSession(): Session {
    const partition = SHARED_EMBEDDED_WEB_PARTITION;
    const sessionRef = session.fromPartition(partition);
    if (this.configuredPartitions.has(partition)) {
      return sessionRef;
    }

    // Session 级别统一设置 UA / Accept-Language，
    // 这样同一 partition 下的后续请求会保持一致身份特征。
    sessionRef.setUserAgent(
      SHARED_CHROME_USER_AGENT,
      SHARED_ACCEPT_LANGUAGES,
    );

    sessionRef.webRequest.onBeforeSendHeaders((details, callback) => {
      callback({
        requestHeaders: {
          ...details.requestHeaders,
          "User-Agent": SHARED_CHROME_USER_AGENT,
          "Accept-Language": SHARED_ACCEPT_LANGUAGES,
        },
      });
    });

    this.configuredPartitions.add(partition);
    return sessionRef;
  }

  private applyUserAgent(webContents: WebContents): void {
    webContents.setUserAgent(SHARED_CHROME_USER_AGENT);
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
    view.webContents.setBackgroundThrottling(!isActive);
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

  private cancelRelease(instanceId: string): void {
    const timer = this.releaseTimers.get(instanceId);
    if (!timer) return;
    clearTimeout(timer);
    this.releaseTimers.delete(instanceId);
  }

  private syncCurrentUrl(instanceId: string, view: WebContentsView): void {
    if (!this.isViewUsable(view)) return;
    const currentUrl = view.webContents.getURL();
    if (!currentUrl || currentUrl.startsWith("about:blank")) return;
    instanceStore.onPageUrlUpdated(instanceId, currentUrl);
  }

  private isViewUsable(view: WebContentsView): boolean {
    return !view.webContents.isDestroyed();
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

    if (!view.webContents.isDestroyed()) {
      try {
        view.webContents.close();
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

  private shouldCloseOAuthPopup(
    hostname: string,
    policy: NavigationPolicy,
  ): boolean {
    if (!policy.isAllowedNavigation(hostname)) {
      return false;
    }

    if (policy.isAllowedPopup(hostname)) {
      return false;
    }

    return hostname !== "myaccount.google.com";
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
