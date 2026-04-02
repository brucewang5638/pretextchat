// ============================================================
// Preload — contextBridge 安全桥接
// ============================================================

import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/constants';
import type { StateSnapshot, Application, PersistedInstance, PersistedWorkspaceState } from '../shared/types';

const api = {
  // ─── Renderer → Main（invoke）─────────────────────────

  getAppList: (): Promise<Application[]> =>
    ipcRenderer.invoke(IPC.GET_APP_LIST),

  createInstance: (appId: string): Promise<PersistedInstance> =>
    ipcRenderer.invoke(IPC.CREATE_INSTANCE, appId),

  closeInstance: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.CLOSE_INSTANCE, id),

  switchInstance: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.SWITCH_INSTANCE, id),

  renameInstance: (id: string, title: string): Promise<void> =>
    ipcRenderer.invoke(IPC.RENAME_INSTANCE, id, title),

  restoreSession: (): Promise<PersistedWorkspaceState | null> =>
    ipcRenderer.invoke(IPC.RESTORE_SESSION),

  getRecent: (): Promise<{ recentApps: string[] }> =>
    ipcRenderer.invoke(IPC.GET_RECENT),

  // ─── Main → Renderer（subscribe）──────────────────────

  onStateSync: (callback: (snapshot: StateSnapshot) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, snapshot: StateSnapshot) => {
      callback(snapshot);
    };
    ipcRenderer.on(IPC.STATE_SYNC, handler);
    // 返回 cleanup 函数
    return () => ipcRenderer.removeListener(IPC.STATE_SYNC, handler);
  },
};

contextBridge.exposeInMainWorld('api', api);

// 导出类型供 renderer 使用
export type PretextChatAPI = typeof api;
