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

  useEffect(() => {
    // 如果当前页面还停在工作台，但已经没有激活实例，
    // 说明实例都被关闭了，此时自动回到启动页，避免留下空工作台。
    if (currentPage === 'workbench' && snapshot?.workspace.activeInstanceId == null) {
      setCurrentPage('launch');
    }
  }, [currentPage, setCurrentPage, snapshot?.workspace.activeInstanceId]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {currentPage === 'workbench' ? <WorkbenchPage /> : <LaunchPage />}
      </div>
    </div>
  );
}
