// ============================================================
// app-runtime.ts — 应用运行时承载辅助函数
// ============================================================
// 这层只负责回答两个问题：
// 1. 当前嵌入网页统一用哪个 partition
// 2. 当前嵌入网页统一使用哪套浏览器身份

export const EMBEDDED_WEB_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
export const EMBEDDED_WEB_ACCEPT_LANGUAGES = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7';
export const EMBEDDED_WEB_PARTITION = 'persist:auth-google';

export function getAppPartition(): string {
  return EMBEDDED_WEB_PARTITION;
}
