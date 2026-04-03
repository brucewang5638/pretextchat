// ============================================================
// WorkbenchPage — 工作台页
// ============================================================
// 页面内容统一由 main 进程的 WebContentsView 承载。

import { useUIStore } from '../../store';
import { TabBar } from '../../components/TabBar/TabBar';

export function WorkbenchPage() {
  const snapshot = useUIStore((s) => s.snapshot);

  return (
    <div className="flex h-full flex-col">
      <TabBar />
      <div className="flex flex-1 min-h-0 bg-[var(--color-bg-primary)]">
        <div className="h-full w-full min-h-0 flex-1">
          {/* WebContentsView 由 main 进程管理并叠加在此区域上方。
              renderer 只负责留出内容区域。*/}
        </div>
      </div>
    </div>
  );
}
