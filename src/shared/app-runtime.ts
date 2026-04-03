// ============================================================
// app-runtime.ts — 应用运行时承载辅助函数
// ============================================================
// 这层只负责回答三个问题：
// 1. 当前 app 用哪个 partition
// 2. 当前 app 用哪种页面承载方式
// 3. renderer <webview> 需要哪些隔离偏好

import type { Application } from './types';

export const GOOGLE_WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';

export function getAppPartition(app: Application): string {
  // 有共享认证需求的站点共用同一个 persist partition，
  // 这样 OAuth 完成后，相关站点能复用同一套 Cookie / 会话状态。
  if (app.authSessionGroup) {
    return `persist:auth-${app.authSessionGroup}`;
  }

  return `persist:${app.id}`;
}

export function isRendererManagedApp(app: Application | null | undefined): boolean {
  return (app?.renderMode ?? 'webContentsView') === 'webview';
}

export function getRendererGuestPreferences(): string {
  // 这里返回的是 <webview> guest 进程的运行偏好字符串，
  // 目的不是“开放能力”，而是显式打开隔离与 sandbox。
  return 'contextIsolation=yes,sandbox=yes';
}
