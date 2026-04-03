// ============================================================
// pretext.ts — Pretext 文本测量封装
// ============================================================
// 这层负责把第三方 Pretext API 转成项目可直接复用的工具函数，
// 避免组件层反复关心 prepare / layout / cache 这些底层细节。

import {
  layoutWithLines,
  prepareWithSegments,
  type LayoutLinesResult,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

// 这里需要和全局 CSS 字体栈保持一致，否则 canvas 测量结果会和真实 DOM 文本产生偏差。
export const DEFAULT_PRETEXT_FONT_FAMILY =
  'Inter, "IBM Plex Sans", "Segoe UI", sans-serif';

interface PretextFontConfig {
  fontStyle?: 'normal' | 'italic';
  fontWeight?: number | string;
  fontSizePx: number;
  fontFamily?: string;
}

// Pretext 的推荐用法是“同一段文本先 prepare，一次准备，多次 layout”。
// 因此这里按 font + text 做进程内缓存，避免组件每次重渲染都重复 prepare。
const preparedTextCache = new Map<string, PreparedTextWithSegments>();

export function buildCanvasFont({
  fontStyle = 'normal',
  fontWeight = 400,
  fontSizePx,
  fontFamily = DEFAULT_PRETEXT_FONT_FAMILY,
}: PretextFontConfig): string {
  // 生成 canvas/font shorthand，格式要和 `ctx.font` 一致。
  return `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;
}

export function getPreparedText(
  text: string,
  font: string,
): PreparedTextWithSegments {
  // prepare 是 Pretext 较重的一步，所以这里做进程内缓存。
  // 文本内容和字体任一变化，都会影响分词与测量结果，所以都要进入 key。
  const cacheKey = `${font}\n${text}`;
  const cached = preparedTextCache.get(cacheKey);
  if (cached) return cached;

  const prepared = prepareWithSegments(text, font);
  preparedTextCache.set(cacheKey, prepared);
  return prepared;
}

export function measurePretextLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeightPx: number,
): LayoutLinesResult | null {
  // 初次挂载前容器宽度可能还是 0，这时跳过测量，等 ResizeObserver 回来后再算。
  if (maxWidth <= 0) return null;

  // 热路径只做 layout，真正昂贵的 prepare 已经在缓存层里复用了。
  return layoutWithLines(getPreparedText(text, font), maxWidth, lineHeightPx);
}
