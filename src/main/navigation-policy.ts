// ============================================================
// NavigationPolicy — 导航拦截策略
// ============================================================
// 控制 WebContentsView 的所有导航行为。
// 匹配规则：hostname-only + *.通配符 + URL prefix。

import { shell } from 'electron';
import type { WebContentsView } from 'electron';
import type { Application } from '../shared/types';
import { eventLogger } from './event-logger';

// ─── URL normalize ──────────────────────────────────────

function normalizeForMatch(rawUrl: string): { hostname: string; normalized: string } | null {
  try {
    const url = new URL(rawUrl);
    return {
      hostname: url.hostname.toLowerCase(),
      normalized: `${url.protocol}//${url.hostname}${url.pathname}`.replace(/\/+$/, ''),
    };
  } catch {
    return null;
  }
}

function matchesHost(hostname: string, pattern: string): boolean {
  const p = pattern.toLowerCase();
  if (p.startsWith('*.')) {
    const suffix = p.slice(1); // '.example.com'
    return hostname.endsWith(suffix) || hostname === p.slice(2);
  }
  return hostname === p;
}

function matchesAnyHost(hostname: string, patterns: string[]): boolean {
  return patterns.some((p) => matchesHost(hostname, p));
}

// ─── NavigationPolicy ───────────────────────────────────

export class NavigationPolicy {
  constructor(private app: Application) {}

  /** 绑定导航策略到 WebContentsView */
  attach(view: WebContentsView): void {
    const { webContents } = view;
    const { navigation } = this.app;

    // 1. 页内导航拦截
    webContents.on('will-navigate', (event, url) => {
      const parsed = normalizeForMatch(url);
      if (!parsed) {
        event.preventDefault();
        return;
      }

      // 允许站内导航
      if (matchesAnyHost(parsed.hostname, navigation.allowedHosts)) return;

      // 外部域名 → 系统浏览器
      if (matchesAnyHost(parsed.hostname, navigation.externalHostnames)) {
        event.preventDefault();
        shell.openExternal(url);
        return;
      }

      // URL 前缀匹配
      if (navigation.externalUrlPrefixes.some((prefix) => parsed.normalized.startsWith(prefix))) {
        event.preventDefault();
        shell.openExternal(url);
        return;
      }

      // 其他 → 拦截
      event.preventDefault();
      eventLogger.log('navigation_blocked', {
        appId: this.app.id,
        url,
        reason: 'not_in_whitelist',
      });
    });

    // 2. 新窗口拦截（OAuth / 外部链接）
    // 注意：OAuth 弹窗的 BrowserWindow 创建由 ViewManager 处理
    // 这里只做策略判断，返回 action
    webContents.setWindowOpenHandler(({ url }) => {
      const parsed = normalizeForMatch(url);
      if (!parsed) return { action: 'deny' as const };

      // 允许的弹窗域名 → ViewManager 负责创建子窗口
      if (matchesAnyHost(parsed.hostname, navigation.allowedPopupHosts)) {
        // 返回 deny，但在 ViewManager 中手动创建 BrowserWindow
        // 这里通过事件通知 ViewManager
        return { action: 'deny' as const };
      }

      // 站内域名 → 允许（某些站点用 window.open）
      if (matchesAnyHost(parsed.hostname, navigation.allowedHosts)) {
        return { action: 'deny' as const }; // 仍然 deny，由 ViewManager 处理
      }

      // 外部 → 系统浏览器
      shell.openExternal(url);
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
