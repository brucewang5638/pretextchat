import { useEffect } from 'react';
import { useStateSync, useInitialize } from './hooks/useIpc';
import { useUIStore } from './store';
import { LaunchPage } from './pages/LaunchPage/LaunchPage';
import { WorkbenchPage } from './pages/WorkbenchPage/WorkbenchPage';
import { Sidebar } from './components/Sidebar/Sidebar';

export function App() {
  console.log('React App rendering. window.api present:', !!window.api);
  
  useStateSync();
  useInitialize();

  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);

  useEffect(() => {
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
