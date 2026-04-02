// ============================================================
// useIpc — IPC 订阅 Hook
// ============================================================

import { useEffect } from 'react';
import { useUIStore } from '../store';
import type { PretextChatAPI } from '../../preload/index';

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

  useEffect(() => {
    async function init() {
      // 先获取应用列表构建初始快照
      const apps = await window.api.getAppList();
      const recent = await window.api.getRecent();

      setSnapshot({
        workspace: { instances: [], tabOrder: [], activeInstanceId: null },
        runtimeStates: {},
        apps,
        preferences: { recentApps: recent.recentApps, restoreOnStartup: true },
      });
    }
    init();
  }, [setSnapshot]);
}
