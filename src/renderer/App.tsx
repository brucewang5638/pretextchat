import { useStateSync, useInitialize } from './hooks/useIpc';
import { useUIStore } from './store';
import { LaunchPage } from './pages/LaunchPage/LaunchPage';
import { WorkbenchPage } from './pages/WorkbenchPage/WorkbenchPage';

export function App() {
  useStateSync();
  useInitialize();

  const snapshot = useUIStore((s) => s.snapshot);
  const hasActiveInstance = snapshot?.workspace.activeInstanceId != null;

  return hasActiveInstance ? <WorkbenchPage /> : <LaunchPage />;
}
