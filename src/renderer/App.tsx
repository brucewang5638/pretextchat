import { useEffect } from 'react';
import { useStateSync, useInitialize } from './hooks/useIpc';
import { useUIStore } from './store';
import { LaunchPage } from './pages/LaunchPage/LaunchPage';
import { WorkbenchPage } from './pages/WorkbenchPage/WorkbenchPage';

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

  return currentPage === 'workbench' ? <WorkbenchPage /> : <LaunchPage />;
}
