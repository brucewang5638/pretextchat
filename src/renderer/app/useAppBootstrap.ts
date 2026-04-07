// ============================================================
// useAppBootstrap — renderer 启动期接线
// ============================================================
// 这里把 renderer 的主进程交互拆成两个内部阶段：
// 1. 持续订阅主进程快照
// 2. 首屏初始化与恢复逻辑

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
function useStateSync(): void {
  const setSnapshot = useUIStore((s) => s.setSnapshot);

  useEffect(() => {
    const cleanup = window.api.onStateSync((snapshot) => {
      setSnapshot(snapshot);
    });
    return cleanup;
  }, [setSnapshot]);
}

/** 初始化：获取应用列表和恢复会话 */
function useInitialize(): void {
  const setSnapshot = useUIStore((s) => s.setSnapshot);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  useEffect(() => {
    async function init() {
      // 启动时先拿一次完整初始快照；
      // 这样 UI 可以先有骨架状态，再决定是否恢复会话。
      const snapshot = await window.api.getInitialState();
      setSnapshot(snapshot);

      if (
        snapshot.preferences.startupMode === 'restoreLastSession' &&
        snapshot.workspace.instances.length > 0
      ) {
        await window.api.restoreSession();

        const refreshedSnapshot = await window.api.getInitialState();
        setSnapshot(refreshedSnapshot);

        const activeInstanceId = refreshedSnapshot.workspace.activeInstanceId;
        const activeInstance =
          activeInstanceId == null
            ? null
            : refreshedSnapshot.workspace.instances.find(
                (instance) => instance.id === activeInstanceId,
              ) ?? null;

        setActiveAppFilter(activeInstance?.applicationId ?? null);
        setCurrentPage(activeInstance ? 'workbench' : 'launch');
        return;
      }

      setActiveAppFilter(null);
      setCurrentPage('launch');
    }
    init();
  }, [setActiveAppFilter, setCurrentPage, setSnapshot]);
}

export function useAppBootstrap(): void {
  useStateSync();
  useInitialize();
}
