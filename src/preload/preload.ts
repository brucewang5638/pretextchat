// ============================================================
// Preload — contextBridge 安全桥接
// ============================================================
// 这里是 renderer 能力边界的“白名单层”。
// renderer 不能直接拿到 Node / Electron 全量 API，
// 而是只通过 preload 暴露过的 window.api 与 main 通信。

import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/constants';
import type {
  StateSnapshot,
  PersistedInstance,
  PersistedWorkspaceState,
  Preferences,
  UpdateCheckResult,
} from '../shared/types';

const api = {
  // ─── Renderer → Main（invoke）─────────────────────────
  // 统一使用 invoke/handle 的请求-响应模型，避免 renderer 直接依赖主进程实现细节。

  // 读取主进程整理好的完整初始快照。
  // 能力含义：给 renderer 首屏提供 apps、workspace、preferences、runtimeStates。
  getInitialState: (): Promise<StateSnapshot> =>
    ipcRenderer.invoke(IPC.GET_INITIAL_STATE),

  // 为某个应用创建一个新的任务实例。
  // 能力含义：主进程会分配实例 ID、写入 workspace，并按承载方式激活它。
  createInstance: (appId: string): Promise<PersistedInstance> =>
    ipcRenderer.invoke(IPC.CREATE_INSTANCE, appId),

  // 关闭指定实例。
  // 能力含义：主进程会销毁对应承载层、更新工作区、必要时切换到新的激活实例。
  closeInstance: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC.CLOSE_INSTANCE, id),

  // 切换当前激活实例；传 null 表示退出工作台内容区，回到“未选中实例”的状态。
  // 能力含义：主进程会切换 activeInstanceId，并显示正确的承载层。
  switchInstance: (id: string | null): Promise<void> =>
    ipcRenderer.invoke(IPC.SWITCH_INSTANCE, id),

  // 重命名实例标题。
  // 能力含义：标题真相源在主进程，renderer 只负责发起请求。
  renameInstance: (id: string, title: string): Promise<void> =>
    ipcRenderer.invoke(IPC.RENAME_INSTANCE, id, title),

  // 从“最近任务”中重新打开实例。
  // 能力含义：如果实例还开着就直接切回；否则按最近记录重建一个实例。
  reopenRecentInstance: (recentId: string): Promise<PersistedInstance> =>
    ipcRenderer.invoke(IPC.REOPEN_RECENT_INSTANCE, recentId),

  // 恢复上次会话。
  // 能力含义：只恢复持久化 metadata，并按需为激活实例重建真实承载视图。
  restoreSession: (): Promise<PersistedWorkspaceState | null> =>
    ipcRenderer.invoke(IPC.RESTORE_SESSION),

  // 修改启动模式。
  // 能力含义：决定下次启动默认进入主页还是自动恢复上次会话。
  setStartupMode: (mode: Preferences['startupMode']): Promise<void> =>
    ipcRenderer.invoke(IPC.SET_STARTUP_MODE, mode),

  // 固定/取消固定某个应用。
  // 能力含义：影响侧边栏入口展示，不直接创建实例。
  togglePinApp: (appId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.TOGGLE_PIN_APP, appId),

  // 更新侧边栏应用排序。
  updateSidebarOrder: (appIds: string[]): Promise<void> =>
    ipcRenderer.invoke(IPC.UPDATE_SIDEBAR_ORDER, appIds),

  // 手动检查更新。
  // 能力含义：已安装的 Windows 版本会真正访问更新源，其他环境返回说明文本。
  checkForUpdates: (): Promise<UpdateCheckResult> =>
    ipcRenderer.invoke(IPC.CHECK_FOR_UPDATES),

  // 用系统默认浏览器打开 URL。
  // 能力含义：renderer 不直接接触 shell，由主进程代为执行。
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC.OPEN_EXTERNAL, url),

  // ─── Main → Renderer（subscribe）──────────────────────
  // 状态同步采用“主进程推送完整快照”的方式。
  // renderer 不维护业务真相源，只消费主进程发来的只读镜像。

  // 订阅主进程状态快照。
  // 能力含义：当 workspace、preferences、runtimeStates 变化时，renderer 能收到统一更新。
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
