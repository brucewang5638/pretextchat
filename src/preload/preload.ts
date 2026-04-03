// ============================================================
// Preload — contextBridge 安全桥接
// ============================================================

import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/constants';
import type {
  StateSnapshot,
  Application,
  PersistedInstance,
  PersistedWorkspaceState,
  Preferences,
} from '../shared/types';

const api = {
  // ─── Renderer → Main（invoke）─────────────────────────

  getAppList: (): Promise<Application[]> =>
    ipcRenderer.invoke(IPC.GET_APP_LIST),

  getInitialState: (): Promise<StateSnapshot> =>
    ipcRenderer.invoke(IPC.GET_INITIAL_STATE),

  createInstance: (appId: string): Promise<PersistedInstance> =>
    ipcRenderer.invoke(IPC.CREATE_INSTANCE, appId),

  closeInstance: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.CLOSE_INSTANCE, id),

  switchInstance: (id: string | null): Promise<void> =>
    ipcRenderer.invoke(IPC.SWITCH_INSTANCE, id),

  renameInstance: (id: string, title: string): Promise<void> =>
    ipcRenderer.invoke(IPC.RENAME_INSTANCE, id, title),

  reopenRecentInstance: (recentId: string): Promise<PersistedInstance> =>
    ipcRenderer.invoke(IPC.REOPEN_RECENT_INSTANCE, recentId),

  restoreSession: (): Promise<PersistedWorkspaceState | null> =>
    ipcRenderer.invoke(IPC.RESTORE_SESSION),

  getRecent: (): Promise<Pick<Preferences, 'recentApps' | 'recentInstances'>> =>
    ipcRenderer.invoke(IPC.GET_RECENT),

  setStartupMode: (mode: Preferences['startupMode']): Promise<void> =>
    ipcRenderer.invoke(IPC.SET_STARTUP_MODE, mode),

  togglePinApp: (appId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.TOGGLE_PIN_APP, appId),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC.OPEN_EXTERNAL, url),

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
