import { useMemo } from 'react';
import { useUIStore } from '../../store';
import { TabBar } from '../../components/TabBar/TabBar';
import { WebviewSurface } from '../../components/WebviewSurface/WebviewSurface';
import styles from './WorkbenchPage.module.css';

export function WorkbenchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const activeInstanceId = snapshot?.workspace.activeInstanceId ?? null;

  const activeInstance = useMemo(
    () => snapshot?.workspace.instances.find((instance) => instance.id === activeInstanceId) ?? null,
    [activeInstanceId, snapshot?.workspace.instances],
  );

  const activeApp = useMemo(
    () => snapshot?.apps.find((app) => app.id === activeInstance?.applicationId) ?? null,
    [activeInstance?.applicationId, snapshot?.apps],
  );

  const isGoogleWebview = activeApp?.id === 'google' && activeApp.renderMode === 'webview';

  return (
    <div className={styles.workbench}>
      <TabBar />
      <div className={styles.viewArea}>
        {isGoogleWebview ? (
          <WebviewSurface
            src={activeApp.startUrl}
            partition="persist:auth-google"
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36"
            title={activeApp.name}
          />
        ) : (
          <div className={styles.nativeViewPlaceholder}>
            {/* WebContentsView 由 main 进程管理并叠加在此区域上方。
                renderer 只需要留出高度空间。*/}
          </div>
        )}
      </div>
    </div>
  );
}
