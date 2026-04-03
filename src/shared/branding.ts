// ============================================================
// branding.ts — 项目品牌资源的统一命名
// ============================================================
// 这里不直接做路径解析，只定义“品牌资源叫什么、放在哪里”。
// 原因：
// 1. renderer 侧适合用 window.location 解析站内资源；
// 2. main / forge 侧适合用文件系统相对路径；
// 3. 统一资源名，避免 logo / icon 在不同层各写一份字符串。

export const BRAND_LOGO_ASSET_PATH =
  "public/images/branding/pretextchat-logo.svg";
export const BRAND_WINDOWS_ICON_BASENAME = "public/images/branding/icon";
export const BRAND_WINDOWS_ICON_RELATIVE_PATH =
  "../../public/images/branding/icon.ico";
