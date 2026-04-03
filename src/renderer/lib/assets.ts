// ============================================================
// assets.ts — 静态资源路径解析
// ============================================================
// 目的：把“相对路径 / 绝对站内路径 / 外链资源”统一转成 renderer 可直接使用的 URL。

export function resolveAssetPath(assetPath: string): string {
  if (/^(https?:|data:|file:)/i.test(assetPath)) {
    return assetPath;
  }

  // 这里基于当前页面地址做 URL 解析，
  // 比手拼字符串更稳，能避免开发环境和打包环境路径基准不同的问题。
  const normalizedPath = assetPath.replace(/^\/+/, '');
  return new URL(normalizedPath, window.location.href).toString();
}
