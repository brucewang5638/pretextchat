// ============================================================
// app-runtime.ts — 应用运行时承载辅助函数
// ============================================================
// 这层只负责回答两个问题：
// 1. 当前 app 用哪个 partition
// 2. 当前嵌入网页统一使用哪套浏览器身份

import type { Application } from './types';

export const SHARED_CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
export const SHARED_ACCEPT_LANGUAGES = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7';
export const SHARED_EMBEDDED_WEB_PARTITION = 'persist:embedded-web';

export function getAppPartition(app: Application): string {
  // 当前产品策略：所有嵌入网页统一共用同一套持久化浏览器身份。
  // 这样不同站点的登录态、Cookie、缓存与 OAuth 会自然复用，
  // 结构也更简单，不再区分按 app / auth group 的多 partition 模型。
  void app;
  return SHARED_EMBEDDED_WEB_PARTITION;
}
