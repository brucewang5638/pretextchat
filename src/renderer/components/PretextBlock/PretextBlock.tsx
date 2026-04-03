// ============================================================
// PretextBlock — 基于 Pretext 的多行文本块
// ============================================================
// 目标不是“把文本显示出来”这么简单，
// 而是让卡片 / 标签等高频布局在不同宽度下仍然稳定可预测。

import { useMemo } from 'react';
import { buildCanvasFont, measurePretextLines } from '../../lib/pretext';
import { useElementWidth } from '../../hooks/useElementWidth';

interface PretextBlockProps {
  text: string;
  className?: string;
  maxLines: number;
  // reserveLines 允许“显示 1 行，但预留 2 行高度”这类布局需求。
  reserveLines?: number;
  lineHeightPx: number;
  fontSizePx: number;
  fontWeight?: number | string;
  fontFamily?: string;
  backgroundColor?: string;
}

type PretextStyle = React.CSSProperties & {
  '--pretext-line-height': string;
  '--pretext-reserve-lines': string;
  '--pretext-bg': string;
};

export function PretextBlock({
  text,
  className,
  maxLines,
  reserveLines = maxLines,
  lineHeightPx,
  fontSizePx,
  fontWeight = 400,
  fontFamily,
  backgroundColor = 'var(--color-bg-card)',
}: PretextBlockProps) {
  // 宽度变化是触发重新 layout 的核心信号。
  const [containerRef, width] = useElementWidth<HTMLDivElement>();

  const font = useMemo(
    () =>
      buildCanvasFont({
        fontSizePx,
        fontWeight,
        fontFamily,
      }),
    [fontFamily, fontSizePx, fontWeight],
  );

  // 只有 text / font / width / lineHeight 变化时才重新计算行布局。
  const layoutResult = useMemo(
    () => measurePretextLines(text, font, width, lineHeightPx),
    [font, lineHeightPx, text, width],
  );

  // Pretext 返回的是“按真实宽度算好的逐行结果”，
  // 所以这里不再依赖 CSS line-clamp 这种只管裁切、不负责精确估高的方案。
  // 这里直接拿 Pretext 已经算好的逐行文本，组件层不再依赖 CSS line-clamp 猜测换行。
  const visibleLines = layoutResult
    ? layoutResult.lines.slice(0, maxLines).map((line) => line.text)
    : [text];
  const isTruncated = layoutResult ? layoutResult.lineCount > maxLines : false;

  const style: PretextStyle = {
    '--pretext-line-height': `${lineHeightPx}px`,
    '--pretext-reserve-lines': String(reserveLines),
    '--pretext-bg': backgroundColor,
    fontSize: `${fontSizePx}px`,
    fontWeight,
  };

  return (
    <div
      ref={containerRef}
      className={className ? `relative block overflow-hidden ${className}` : 'relative block overflow-hidden'}
      style={style}
      // 截断后仍然保留原始完整文案的可访问入口。
      title={text}
    >
      <div
        className="flex flex-col"
        style={{
          height: 'calc(var(--pretext-reserve-lines) * var(--pretext-line-height))',
          lineHeight: 'var(--pretext-line-height)',
        }}
      >
        {visibleLines.map((line, index) => (
          <span
            key={`${index}-${line}`}
            className="block min-h-[var(--pretext-line-height)] whitespace-pre-wrap [overflow-wrap:anywhere]"
          >
            {line}
          </span>
        ))}
      </div>
      {/* 当前版本的省略号是视觉提示，不参与 Pretext 的最后一行精确拟合。 */}
      {isTruncated ? (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 pl-4"
          style={{
            background: 'linear-gradient(90deg, rgb(255 255 255 / 0%) 0%, var(--pretext-bg) 42%)',
          }}
        >
          …
        </span>
      ) : null}
    </div>
  );
}
