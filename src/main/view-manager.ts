// ============================================================
// ViewManager — WebContentsView 生命周期管理
// ============================================================
// 创建/显示/隐藏/销毁 WebContentsView。
// 恢复策略：metadata 恢复 + lazy view recreate。
// OAuth 弹窗：临时子 BrowserWindow + 可共享认证 partition。

import { BrowserWindow, WebContentsView, session, shell } from 'electron';
import type { Session, WebContents } from 'electron';
import type { Rectangle, Application } from '../shared/types';
import { getAppPartition, GOOGLE_WEBVIEW_USER_AGENT } from '../shared/app-runtime';
import { NavigationPolicy } from './navigation-policy';
import { instanceStore } from './instance-store';
import { eventLogger } from './event-logger';

const DEFAULT_ACCEPT_LANGUAGES = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7';

function sanitizeAppUserAgent(userAgent: string): string {
  return userAgent
    .replace(/PretextChat\/[0-9\.-]+ /, '')
    .replace(/Electron\/[0-9\.-]+ /, '');
}

function getUserAgentProfile(app: Application): { userAgent: string | null; acceptLanguages: string } {
  if (app.authUserAgentProfile === 'google') {
    return {
      userAgent: GOOGLE_WEBVIEW_USER_AGENT,
      acceptLanguages: DEFAULT_ACCEPT_LANGUAGES,
    };
  }

  return {
    userAgent: null,
    acceptLanguages: DEFAULT_ACCEPT_LANGUAGES,
  };
}

class ViewManager {
  private static readonly RELEASE_AFTER_HIDDEN_MS = 3 * 60 * 1000;
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
    // 更新当前可见 View 的布局
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
  create(instanceId: string, app: Application): WebContentsView {
    if (!this.mainWindow) throw new Error('MainWindow not set');
    this.cancelRelease(instanceId);
    const partition = getAppPartition(app);
    const sessionRef = this.configureSession(app);

    const view = new WebContentsView({
      webPreferences: {
        partition,
        session: sessionRef,
        contextIsolation: true,
        sandbox: true,
      },
    });

    this.applyUserAgent(view.webContents, app);

    // 绑定导航策略
    const policy = new NavigationPolicy(app);
    policy.attach(view);

    // 处理 OAuth 弹窗
    this.setupPopupHandler(view, app, policy);

    // 监听页面标题变更
    view.webContents.on('page-title-updated', (_event, title) => {
      instanceStore.onPageTitleUpdated(instanceId, title);
    });

    // 监听加载状态
    view.webContents.on('did-start-loading', () => {
      instanceStore.updateRuntimeStatus(instanceId, 'loading');
    });
    view.webContents.on('did-finish-load', () => {
      instanceStore.updateRuntimeStatus(instanceId, 'ready');
    });
    view.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      instanceStore.updateRuntimeStatus(instanceId, 'error', errorDescription);
      eventLogger.log('load_failed', { appId: app.id, instanceId, errorCode, errorDescription });
    });

    // 记录 webContentsId
    instanceStore.setWebContentsId(instanceId, view.webContents.id);

    // 添加到窗口并加载
    this.mainWindow.contentView.addChildView(view);
    view.setBounds(this.contentBounds);
    this.applyViewActivity(instanceId, view, true);
    view.webContents.loadURL(app.startUrl);

    this.views.set(instanceId, view);
    return view;
  }

  /** 显示指定实例的 View，传 null 隐藏所有 */
  show(instanceId: string | null): void {
    if (!this.mainWindow) return;

    // 隐藏所有其他 View
    for (const [id, view] of this.views) {
      if (instanceId !== null && id === instanceId) {
        view.setBounds(this.contentBounds);
        this.applyViewActivity(id, view, true);
      } else {
        view.setBounds({ x: -10000, y: -10000, width: 0, height: 0 });
        this.applyViewActivity(id, view, false);
      }
    }
  }

  /** 销毁 View */
  destroy(instanceId: string): void {
    const view = this.views.get(instanceId);
    if (!view || !this.mainWindow) return;

    this.cancelRelease(instanceId);
    this.mainWindow.contentView.removeChildView(view);
    instanceStore.setViewBounds(instanceId, null);
    instanceStore.setWebContentsId(instanceId, null);
    view.webContents.close();
    this.views.delete(instanceId);
  }

  /** 检查 View 是否已创建 */
  hasView(instanceId: string): boolean {
    return this.views.has(instanceId);
  }

  /** 销毁所有 View */
  destroyAll(): void {
    for (const id of this.views.keys()) {
      this.destroy(id);
    }
  }

  release(instanceId: string): void {
    const view = this.views.get(instanceId);
    if (!view || !this.mainWindow) return;

    this.cancelRelease(instanceId);
    this.mainWindow.contentView.removeChildView(view);
    view.webContents.close();
    this.views.delete(instanceId);
    instanceStore.markReleased(instanceId);
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
        return { action: 'deny' as const };
      }

      // OAuth 弹窗 → 创建临时子窗口
      if (policy.isAllowedPopup(hostname)) {
        this.openOAuthPopup(url, app, policy);
        return { action: 'deny' as const };
      }

      // 站内域名 → 在当前 View 内导航
      if (policy.isAllowedNavigation(hostname)) {
        view.webContents.loadURL(url);
        return { action: 'deny' as const };
      }

      // 外部 → 系统浏览器
      shell.openExternal(url);
      return { action: 'deny' as const };
    });
  }

  private openOAuthPopup(url: string, app: Application, policy: NavigationPolicy): void {
    if (!this.mainWindow) return;
    const partition = getAppPartition(app);
    const sessionRef = this.configureSession(app);

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

    this.applyUserAgent(popup.webContents, app);
    popup.once('ready-to-show', () => popup.show());

    popup.loadURL(url);

    // 检测 OAuth 完成：跳回 AI 站域名时自动关闭
    popup.webContents.on('will-navigate', (_event, navUrl) => {
      try {
        const navHost = new URL(navUrl).hostname.toLowerCase();
        if (policy.isAllowedNavigation(navHost)) {
          popup.close();
        }
      } catch {
        // ignore invalid URLs
      }
    });
  }

  private configureSession(app: Application): Session {
    const partition = getAppPartition(app);
    const sessionRef = session.fromPartition(partition);
    if (this.configuredPartitions.has(partition)) {
      return sessionRef;
    }

    const originalUserAgent = sessionRef.getUserAgent();
    const sanitizedUserAgent = sanitizeAppUserAgent(originalUserAgent);
    const profile = getUserAgentProfile(app);
    sessionRef.setUserAgent(sanitizedUserAgent, profile.acceptLanguages);

    sessionRef.webRequest.onBeforeSendHeaders((details, callback) => {
      const isGoogleRequest = details.url.includes('google.com');
      const userAgent = isGoogleRequest
        ? originalUserAgent
        : profile.userAgent ?? sanitizedUserAgent;

      callback({
        requestHeaders: {
          ...details.requestHeaders,
          'User-Agent': userAgent,
          'Accept-Language': profile.acceptLanguages,
        },
      });
    });

    this.configuredPartitions.add(partition);
    return sessionRef;
  }

  private applyUserAgent(
    webContents: WebContents,
    app: Application,
  ): void {
    const profile = getUserAgentProfile(app);

    if (profile.userAgent) {
      webContents.setUserAgent(profile.userAgent);
      return;
    }

    const sanitizedUA = sanitizeAppUserAgent(webContents.userAgent);
    webContents.setUserAgent(sanitizedUA);
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
    instanceStore.setHostingState(instanceId, isActive ? 'active' : 'throttled');
    instanceStore.setViewBounds(instanceId, isActive ? this.contentBounds : null);
    if (!isActive) {
      this.scheduleRelease(instanceId);
    }
  }

  private scheduleRelease(instanceId: string): void {
    this.cancelRelease(instanceId);
    const timer = setTimeout(() => {
      const activeId = instanceStore.getWorkspaceState().activeInstanceId;
      if (activeId === instanceId) return;
      this.release(instanceId);
    }, ViewManager.RELEASE_AFTER_HIDDEN_MS);
    this.releaseTimers.set(instanceId, timer);
  }

  private cancelRelease(instanceId: string): void {
    const timer = this.releaseTimers.get(instanceId);
    if (!timer) return;
    clearTimeout(timer);
    this.releaseTimers.delete(instanceId);
  }
}

export const viewManager = new ViewManager();
