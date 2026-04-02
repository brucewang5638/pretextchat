// ============================================================
// useIpc — IPC 订阅 Hook
// ============================================================

import { useEffect } from 'react';
import { useUIStore } from '../store';
import type { PretextChatAPI } from '../../preload/preload';

// 从 window.api 获取类型安全的 API
declare global {
  interface Window {
    api: PretextChatAPI;
  }
}

/** 订阅 main 进程的状态同步 */
export function useStateSync(): void {
  const setSnapshot = useUIStore((s) => s.setSnapshot);

  useEffect(() => {
    const cleanup = window.api.onStateSync((snapshot) => {
      setSnapshot(snapshot);
    });
    return cleanup;
  }, [setSnapshot]);
}

/** 初始化：获取应用列表和恢复会话 */
export function useInitialize(): void {
  const setSnapshot = useUIStore((s) => s.setSnapshot);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);

  useEffect(() => {
    async function init() {
      const snapshot = await window.api.getInitialState();
      setSnapshot(snapshot);

      if (
        snapshot.preferences.startupMode === 'restoreLastSession' &&
        snapshot.workspace.instances.length > 0
      ) {
        setCurrentPage('workbench');
        await window.api.restoreSession();
      } else {
        setCurrentPage('launch');
      }
    }
    init();
  }, [setCurrentPage, setSnapshot]);
}
