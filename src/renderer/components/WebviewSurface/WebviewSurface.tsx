// ============================================================
// WebviewSurface — renderer 侧的特例承载层
// ============================================================
// 只有极少数兼容性站点才走这里。
// 常规站点仍然优先由 main 进程的 WebContentsView 承载。

import { useEffect, useRef } from 'react';

import { getRendererGuestPreferences } from '../../../shared/app-runtime';
import { evaluateNavigation, evaluateWindowOpen } from '../../../shared/navigation-rules';
import type { Application } from '../../../shared/types';

interface WebviewSurfaceProps {
  app: Application;
  src: string;
  partition: string;
  userAgent?: string;
}

export function WebviewSurface({ app, src, partition, userAgent }: WebviewSurfaceProps) {
  const webviewRef = useRef<HTMLWebViewElement | null>(null);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    // 虽然这里是 renderer <webview>，但导航判定仍然复用 shared/navigation-rules，
    // 目的是让两种承载方式尽量遵循同一套“允许 / 外链 / 拦截”规则。
    const handleWillNavigate = (event: Event) => {
      const nextUrl = (event as Event & { url?: string }).url;
      if (!nextUrl) return;

      const decision = evaluateNavigation(app, nextUrl);
      if (decision === 'allow') return;

      event.preventDefault();
      if (decision === 'external') {
        // renderer 不直接碰 shell，而是通过 preload 白名单能力转给主进程执行。
        void window.api.openExternal(nextUrl);
      }
    };
    const handleNewWindow = (event: Event) => {
      const nextUrl = (event as Event & { url?: string }).url;
      if (!nextUrl) return;

      const decision = evaluateWindowOpen(app, nextUrl);
      if (decision === 'allow' || decision === 'popup') return;

      event.preventDefault();
      if (decision === 'external') {
        void window.api.openExternal(nextUrl);
      }
    };

    webview.addEventListener('will-navigate', handleWillNavigate);
    webview.addEventListener('new-window', handleNewWindow);

    return () => {
      webview.removeEventListener('will-navigate', handleWillNavigate);
      webview.removeEventListener('new-window', handleNewWindow);
    };
  }, [app]);

  return (
    <div className="relative flex h-full w-full flex-1 min-h-0 bg-[radial-gradient(circle_at_top,rgba(115,138,255,0.08),transparent_32%),var(--color-bg-primary)]">
      <webview
        ref={(node) => {
          webviewRef.current = node as HTMLWebViewElement | null;
        }}
        className="flex h-full w-full flex-1 border-0"
        src={src}
        partition={partition}
        allowpopups
        useragent={userAgent}
        // guest 进程的隔离偏好由 shared/app-runtime 统一给出，
        // 避免每个 <webview> 自己拼字符串，导致安全参数分叉。
        webpreferences={getRendererGuestPreferences()}
      />
    </div>
  );
}
