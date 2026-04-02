import { useEffect, useRef, useState } from 'react';
import styles from './WebviewSurface.module.css';

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
    <div className={styles.surface}>
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingTitle}>{title}</div>
            <div className={styles.loadingText}>正在准备安全登录环境...</div>
          </div>
        </div>
      ) : null}

      <webview
        ref={(node) => {
          webviewRef.current = node as HTMLWebViewElement | null;
        }}
        className={styles.webview}
        src={src}
        partition={partition}
        allowpopups
        useragent={userAgent}
      />
    </div>
  );
}
