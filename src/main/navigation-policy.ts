// ============================================================
// NavigationPolicy — 导航拦截策略
// ============================================================
// 控制 WebContentsView 的所有导航行为。
// 匹配规则：hostname-only + *.通配符 + URL prefix。

import { shell } from 'electron';
import type { WebContentsView } from 'electron';
import type { Application } from '../shared/types';
import { evaluateNavigation, evaluateWindowOpen, matchesAnyHost } from '../shared/navigation-rules';
import { eventLogger } from './event-logger';

// ─── NavigationPolicy ───────────────────────────────────

export class NavigationPolicy {
  constructor(private app: Application) {}

  /** 绑定导航策略到 WebContentsView */
  attach(view: WebContentsView): void {
    const { webContents } = view;

    // 1. 页内导航拦截
    // will-navigate 是“当前页面准备跳去别的地址”时的拦截点，
    // 适合实现站内允许、站外外链、未知拦截的主策略。
    webContents.on('will-navigate', (event, url) => {
      const decision = evaluateNavigation(this.app, url);
      if (decision === 'allow') {
        return;
      }

      event.preventDefault();
      if (decision === 'external') {
        shell.openExternal(url);
        return;
      }

      eventLogger.log('navigation_blocked', {
        appId: this.app.id,
        url,
        reason: 'not_in_whitelist',
      });
    });

    // 2. 新窗口拦截（OAuth / 外部链接）
    // 注意：OAuth 弹窗的 BrowserWindow 创建由 ViewManager 处理
    webContents.setWindowOpenHandler(({ url }) => {
      const decision = evaluateWindowOpen(this.app, url);
      if (decision === 'popup') {
        return { action: 'deny' as const };
      }

      if (decision === 'allow') {
        return { action: 'deny' as const };
      }

      if (decision === 'external') {
        shell.openExternal(url);
        return { action: 'deny' as const };
      }

      eventLogger.log('navigation_blocked', {
        appId: this.app.id,
        url,
        reason: 'popup_not_in_whitelist',
      });
      return { action: 'deny' as const };
    });
  }

  /** 检查是否为允许的站内导航 */
  isAllowedNavigation(hostname: string): boolean {
    return matchesAnyHost(hostname, this.app.navigation.allowedHosts);
  }

  /** 检查是否为允许的弹窗 */
  isAllowedPopup(hostname: string): boolean {
    return matchesAnyHost(hostname, this.app.navigation.allowedPopupHosts);
  }
}
