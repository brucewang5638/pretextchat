// ============================================================
// App.tsx — renderer 根组件
// ============================================================
// 这里是 renderer 视角下的“页面调度层”：
// 1. 订阅主进程状态
// 2. 初始化首屏
// 3. 决定当前显示 LaunchPage 还是 WorkbenchPage

import { useEffect } from 'react';
import { useAppBootstrap } from './app/useAppBootstrap';
import { useUIStore } from './store';
import { LaunchPage } from './features/launch/LaunchPage';
import { WorkbenchPage } from './features/workbench/WorkbenchPage';
import { Sidebar } from './features/workbench/sidebar/Sidebar';

export function App() {
  console.log('React App rendering. window.api present:', !!window.api);

  // 启动时先接上状态同步，再跑初始化逻辑；
  // 这样主进程一旦推送快照，UI 可以立即接住。
  useAppBootstrap();

  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  useEffect(() => {
    // 只有工作区里真的没有实例时，才回到启动页。
    // 启动恢复阶段如果 activeInstanceId 还在恢复中，不要过早把页面打回 launch。
    if (currentPage === 'workbench' && (snapshot?.workspace.instances.length ?? 0) === 0) {
      setActiveAppFilter(null);
      setCurrentPage('launch');
    }
  }, [currentPage, setActiveAppFilter, setCurrentPage, snapshot?.workspace.instances.length]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {currentPage === 'workbench' ? <WorkbenchPage /> : <LaunchPage />}
      </div>
    </div>
  );
}
