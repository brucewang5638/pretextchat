// ============================================================
// ViewManager — WebContentsView 生命周期管理
// ============================================================
// 创建/显示/隐藏/销毁 WebContentsView。
// 恢复策略：metadata 恢复 + lazy view recreate。
// OAuth 弹窗：临时子 BrowserWindow + 可共享认证 partition。

import { BrowserWindow, WebContentsView, session, shell } from 'electron';
import type { Session, WebContents } from 'electron';
import type { Rectangle, Application } from '../shared/types';
import { NavigationPolicy } from './navigation-policy';
import { instanceStore } from './instance-store';
import { eventLogger } from './event-logger';

const DEFAULT_ACCEPT_LANGUAGES = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7';
const GOOGLE_AUTH_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

function getPartition(app: Application): string {
  if (app.authSessionGroup) {
    return `persist:auth-${app.authSessionGroup}`;
  }
  return `persist:${app.id}`;
}

function getUserAgentProfile(app: Application): { userAgent: string | null; acceptLanguages: string } {
  if (app.authUserAgentProfile === 'google') {
    return {
      userAgent: GOOGLE_AUTH_USER_AGENT,
      acceptLanguages: DEFAULT_ACCEPT_LANGUAGES,
    };
  }

  return {
    userAgent: null,
    acceptLanguages: DEFAULT_ACCEPT_LANGUAGES,
  };
}

class ViewManager {
  private views: Map<string, WebContentsView> = new Map();
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
      }
    }
  }

  /** 创建 WebContentsView 并加载 URL */
  create(instanceId: string, app: Application): WebContentsView {
    if (!this.mainWindow) throw new Error('MainWindow not set');
    const partition = getPartition(app);
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
      } else {
        view.setBounds({ x: -10000, y: -10000, width: 0, height: 0 });
      }
    }
  }

  /** 销毁 View */
  destroy(instanceId: string): void {
    const view = this.views.get(instanceId);
    if (!view || !this.mainWindow) return;

    this.mainWindow.contentView.removeChildView(view);
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
    const partition = getPartition(app);
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
    const partition = getPartition(app);
    const sessionRef = session.fromPartition(partition);
    if (this.configuredPartitions.has(partition)) {
      return sessionRef;
    }

    const profile = getUserAgentProfile(app);
    sessionRef.setUserAgent(profile.userAgent ?? sessionRef.getUserAgent(), profile.acceptLanguages);

    if (profile.userAgent) {
      const userAgent = profile.userAgent;
      const acceptLanguages = profile.acceptLanguages;
      sessionRef.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({
          requestHeaders: {
            ...details.requestHeaders,
            'User-Agent': userAgent,
            'Accept-Language': acceptLanguages,
          },
        });
      });
    }

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

    const sanitizedUA = webContents.userAgent
      .replace(/PretextChat\/[0-9\.-]+ /, '')
      .replace(/Electron\/[0-9\.-]+ /, '');
    webContents.setUserAgent(sanitizedUA);
  }
}

export const viewManager = new ViewManager();
