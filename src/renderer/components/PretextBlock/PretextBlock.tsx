import { useMemo } from 'react';
import { buildCanvasFont, measurePretextLines } from '../../lib/pretext';
import { useElementWidth } from '../../hooks/useElementWidth';
import styles from './PretextBlock.module.css';

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
      className={className ? `${styles.root} ${className}` : styles.root}
      style={style}
      // 截断后仍然保留原始完整文案的可访问入口。
      title={text}
    >
      <div className={styles.inner}>
        {visibleLines.map((line, index) => (
          <span key={`${index}-${line}`} className={styles.line}>
            {line}
          </span>
        ))}
      </div>
      {/* 当前版本的省略号是视觉提示，不参与 Pretext 的最后一行精确拟合。 */}
      {isTruncated ? (
        <span aria-hidden="true" className={styles.ellipsis}>
          …
        </span>
      ) : null}
    </div>
  );
}
