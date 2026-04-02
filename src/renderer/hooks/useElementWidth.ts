import { useLayoutEffect, useRef, useState } from 'react';

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = (nextWidth: number) => {
      // 宽度统一取整，避免亚像素抖动导致重复 layout / render。
      const roundedWidth = Math.round(nextWidth);
      setWidth((currentWidth) =>
        currentWidth === roundedWidth ? currentWidth : roundedWidth,
      );
    };

    // 首次同步读取，避免首帧必须等待 ResizeObserver 才有宽度。
    updateWidth(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateWidth(entry.contentRect.width);
    });

    observer.observe(element);
    // 组件卸载时及时断开，避免观察悬挂 DOM。
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
