// ============================================================
// WorkbenchPage — 工作台页
// ============================================================
// 这里是页面承载分流点：
// - 常规应用：main 进程 WebContentsView
// - 少数特例：renderer <webview>

import { useMemo } from 'react';
import { useUIStore } from '../../store';
import { TabBar } from '../../components/TabBar/TabBar';
import { WebviewSurface } from '../../components/WebviewSurface/WebviewSurface';
import { getAppPartition, GOOGLE_WEBVIEW_USER_AGENT, isRendererManagedApp } from '../../../shared/app-runtime';

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

  const isRendererWebview = isRendererManagedApp(activeApp);

  return (
    <div className="flex h-full flex-col">
      <TabBar />
      <div className="flex flex-1 min-h-0 bg-[var(--color-bg-primary)]">
        {activeApp && isRendererWebview ? (
          // webview 是少数兼容性特例；常规站点优先走 main 进程统一托管的 WebContentsView。
          <WebviewSurface
            app={activeApp}
            src={activeApp.startUrl}
            partition={getAppPartition(activeApp)}
            userAgent={GOOGLE_WEBVIEW_USER_AGENT}
            title={activeApp.name}
          />
        ) : (
          <div className="h-full w-full min-h-0 flex-1">
            {/* WebContentsView 由 main 进程管理并叠加在此区域上方。
                renderer 只需要留出高度空间。*/}
          </div>
        )}
      </div>
    </div>
  );
}
