import { useEffect, useRef, useState } from 'react';

import { getRendererGuestPreferences } from '../../../shared/app-runtime';

interface WebviewSurfaceProps {
  src: string;
  partition: string;
  userAgent?: string;
  title: string;
}

export function WebviewSurface({ src, partition, userAgent, title }: WebviewSurfaceProps) {
  const webviewRef = useRef<HTMLWebViewElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleStart = () => setIsLoading(true);
    const handleFinish = () => setIsLoading(false);
    const handleFail = () => setIsLoading(false);

    webview.addEventListener('did-start-loading', handleStart);
    webview.addEventListener('did-stop-loading', handleFinish);
    webview.addEventListener('did-fail-load', handleFail);

    return () => {
      webview.removeEventListener('did-start-loading', handleStart);
      webview.removeEventListener('did-stop-loading', handleFinish);
      webview.removeEventListener('did-fail-load', handleFail);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full flex-1 min-h-0 bg-[radial-gradient(circle_at_top,rgba(115,138,255,0.08),transparent_32%),var(--color-bg-primary)]">
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[rgba(15,15,18,0.22)] [backdrop-filter:blur(8px)]">
          <div className="min-w-[280px] rounded-[18px] border border-white/10 bg-[rgba(20,22,28,0.88)] px-5 py-[18px] shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
            <div className="text-sm font-bold text-[var(--color-text-primary)]">{title}</div>
            <div className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">正在准备安全登录环境...</div>
          </div>
        </div>
      ) : null}

      <webview
        ref={(node) => {
          webviewRef.current = node as HTMLWebViewElement | null;
        }}
        className="flex h-full w-full flex-1 border-0"
        src={src}
        partition={partition}
        allowpopups
        useragent={userAgent}
        webpreferences={getRendererGuestPreferences()}
      />
    </div>
  );
}
