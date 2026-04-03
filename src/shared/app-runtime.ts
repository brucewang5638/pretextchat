// ============================================================
// app-runtime.ts — 应用运行时承载辅助函数
// ============================================================
// 这层只负责回答两个问题：
// 1. 当前 app 用哪个 partition
// 2. 当前 app 该使用怎样的 UA / 会话画像

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
