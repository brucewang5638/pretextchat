// ============================================================
// ViewManager — WebContentsView 生命周期管理
// ============================================================
// 创建/显示/隐藏/销毁 WebContentsView。
// 恢复策略：metadata 恢复 + lazy view recreate。
// OAuth 弹窗：临时子 BrowserWindow + 共享 partition。

import { BrowserWindow, WebContentsView, shell } from 'electron';
import type { Rectangle, Application } from '../shared/types';
import { NavigationPolicy } from './navigation-policy';
import { instanceStore } from './instance-store';
import { eventLogger } from './event-logger';

/** Partition 派生规则：统一由 app.id 派生 */
function getPartition(appId: string): string {
  return `persist:${appId}`;
}

class ViewManager {
  private views: Map<string, WebContentsView> = new Map();
  private mainWindow: BrowserWindow | null = null;
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

    const view = new WebContentsView({
      webPreferences: {
        partition: getPartition(app.id),
        contextIsolation: true,
        sandbox: true,
      },
    });

    // 突破 Google 等严格的 OAuth 限制：伪装为纯净 Chrome
    const defaultUA = view.webContents.userAgent;
    view.webContents.userAgent = defaultUA
      .replace(/PretextChat\/[0-9\.-]+ /, '')
      .replace(/Electron\/[0-9\.-]+ /, '');

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

    const popup = new BrowserWindow({
      width: 500,
      height: 700,
      parent: this.mainWindow,
      modal: true,
      webPreferences: {
        partition: getPartition(app.id), // 共享 session，OAuth 成功后 Cookie 自动生效
        contextIsolation: true,
        sandbox: true,
      },
    });

    // 同样为弹窗伪装 UA
    const defaultUA = popup.webContents.userAgent;
    popup.webContents.userAgent = defaultUA
      .replace(/PretextChat\/[0-9\.-]+ /, '')
      .replace(/Electron\/[0-9\.-]+ /, '');

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
}

export const viewManager = new ViewManager();
