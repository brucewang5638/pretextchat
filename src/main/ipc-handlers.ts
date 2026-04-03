// ============================================================
// IPC Handlers — 统一注册
// ============================================================
// 当前集中管理主进程 IPC 入口。
// 每个入口必须做运行时校验。

import { ipcMain, BrowserWindow } from 'electron';
import { shell } from 'electron';
import { IPC } from '../shared/constants';
import type { Application, PersistedWorkspaceState, PersistedInstance, StateSnapshot } from '../shared/types';
import { appRegistry } from './app-registry';
import { instanceStore } from './instance-store';
import { viewManager } from './view-manager';
import { localStore } from './local-store';
import { eventLogger } from './event-logger';

/** 校验 PersistedWorkspaceState 结构完整性 */
function isValidWorkspaceState(state: unknown): state is PersistedWorkspaceState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  return (
    Array.isArray(s.instances) &&
    Array.isArray(s.tabOrder) &&
    (s.activeInstanceId === null || typeof s.activeInstanceId === 'string')
  );
}

/** 构建完整状态快照推送给 renderer */
function buildStateSnapshot(): StateSnapshot {
  return {
    workspace: instanceStore.getWorkspaceState(),
    runtimeStates: instanceStore.getRuntimeStates(),
    apps: appRegistry.getAll(),
    preferences: localStore.getPreferences(),
  };
}

/** 推送状态到所有 renderer */
function syncState(): void {
  // 当前采用“全量快照推送”，而不是细粒度事件风暴。
  // 原理：数据规模不大时，全量快照更容易保证 renderer 始终看到一致状态。
  const snapshot = buildStateSnapshot();
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(IPC.STATE_SYNC, snapshot);
  });
}

function ensureNativeView(instance: PersistedInstance, app: Application): void {
  if (!viewManager.hasView(instance.id)) {
    viewManager.create(instance.id, app);
  }
}

function showInstance(instanceId: string | null): void {
  viewManager.show(instanceId);
}

function requireAppId(value: unknown): string {
  if (typeof value !== 'string' || !appRegistry.has(value)) {
    throw new Error(`Invalid appId: ${String(value)}`);
  }
  return value;
}

function requireInstanceId(value: unknown): string {
  if (typeof value !== 'string' || !instanceStore.has(value)) {
    throw new Error(`Invalid instanceId: ${String(value)}`);
  }
  return value;
}

function getAppForInstance(instanceId: string): Application | undefined {
  const instance = instanceStore.getInstance(instanceId);
  return instance ? appRegistry.get(instance.applicationId) : undefined;
}

function activateInstance(instanceId: string): void {
  const instance = instanceStore.getInstance(instanceId);
  const app = instance ? appRegistry.get(instance.applicationId) : undefined;

  if (!instance || !app) {
    throw new Error(`Unable to activate instance: ${instanceId}`);
  }

  // “激活实例”统一等价于：
  // 1. 按需创建 native view
  // 2. 把正确的实例切到前台
  ensureNativeView(instance, app);
  showInstance(instanceId);
}

function showCurrentActiveInstance(): void {
  const activeInstanceId = instanceStore.getWorkspaceState().activeInstanceId;
  if (!activeInstanceId) return;
  activateInstance(activeInstanceId);
}

export function registerIpcHandlers(): void {
  // 注册状态变更回调
  instanceStore.onChange(() => syncState());

  // ─── [app] 应用目录 ──────────────────────────────────

  ipcMain.handle(IPC.GET_INITIAL_STATE, () => {
    // 实现方式：
    // 直接构建一份完整快照返回给 renderer。
    // 这里不做增量拼装，目的是让首屏拿到的数据结构与后续 STATE_SYNC 完全一致。
    return buildStateSnapshot();
  });

  // ─── [instance] 实例生命周期 ──────────────────────────

  ipcMain.handle(IPC.CREATE_INSTANCE, (_event, appId: unknown) => {
    const validAppId = requireAppId(appId);
    const instance = instanceStore.createInstance(validAppId);

    // 实现方式：
    // 1. InstanceStore 先写入 workspace metadata
    // 2. activateInstance 再统一处理“native view 懒创建 / 显示”
    activateInstance(instance.id);

    eventLogger.log('instance_created', { appId: validAppId, instanceId: instance.id });
    return instance;
  });

  ipcMain.handle(IPC.REOPEN_RECENT_INSTANCE, (_event, recentId: unknown) => {
    if (typeof recentId !== 'string') {
      throw new Error(`Invalid recent instance id: ${String(recentId)}`);
    }

    // 实现方式：
    // recentId 如果仍对应当前已打开实例，则只做切换；
    // 如果实例已经不存在，则根据最近记录重新 create 一个实例。
    const existing = instanceStore.getInstance(recentId);
    const instance = instanceStore.reopenRecentInstance(recentId);
    if (!existing) {
      activateInstance(instance.id);
    } else {
      showCurrentActiveInstance();
    }
    syncState();
    return instance;
  });

  ipcMain.handle(IPC.CLOSE_INSTANCE, (_event, id: unknown) => {
    const instanceId = requireInstanceId(id);
    const app = getAppForInstance(instanceId);

    // 实现方式：
    // 常规站点先销毁真实承载视图，再从 workspace 移除 metadata；
    // 如果关闭的是当前激活实例，则自动显示新的 activeInstance。
    if (app) viewManager.destroy(instanceId);
    instanceStore.closeInstance(instanceId);
    eventLogger.log('instance_closed', { instanceId });

    showCurrentActiveInstance();
  });

  ipcMain.handle(IPC.SWITCH_INSTANCE, (_event, id: unknown) => {
    if (id === null) {
      // 传 null 的语义不是“关闭实例”，而是“取消当前内容区展示”。
      instanceStore.switchTo(null);
      viewManager.show(null);
      eventLogger.log('instance_switched', { instanceId: null });
      return;
    }

    const instanceId = requireInstanceId(id);

    // 实现方式：
    // 先切换主进程真相源 activeInstanceId，
    // 再通过 activateInstance 把对应承载层切到前台。
    instanceStore.switchTo(instanceId);
    activateInstance(instanceId);
    eventLogger.log('instance_switched', { instanceId });
  });

  ipcMain.handle(IPC.RENAME_INSTANCE, (_event, id: unknown, title: unknown) => {
    const instanceId = requireInstanceId(id);
    if (typeof title !== 'string' || title.length === 0 || title.length > 100) {
      throw new Error('Invalid title: must be 1-100 characters');
    }

    // 实现方式：
    // 标题只改主进程真相源，后续由统一快照同步回 renderer。
    instanceStore.rename(instanceId, title);
    eventLogger.log('instance_renamed', { instanceId, title });
  });

  // ─── [session] 会话恢复 ────────────────────────────────

  ipcMain.handle(IPC.RESTORE_SESSION, () => {
    const snapshot = instanceStore.restoreSnapshot();

    if (snapshot && !isValidWorkspaceState(snapshot)) {
      eventLogger.log('restore_failed', { reason: 'corrupt_snapshot' });
      return null;
    }

    if (snapshot && snapshot.instances.length > 0) {
      // 恢复策略只恢复 metadata，并只为“当前激活实例”按需创建真实视图，
      // 这样启动时不会把所有历史实例的网页一次性全拉起来。
      // 实现方式：
      // 1. 从持久化层取回 workspace snapshot
      // 2. 不批量创建 view，只对 activeInstance 走 activate 流程
      showCurrentActiveInstance();
      eventLogger.log('restore_success', {
        instanceCount: snapshot.instances.length,
        activeId: snapshot.activeInstanceId,
      });
    }

    syncState();
    return snapshot;
  });
  ipcMain.handle(IPC.SET_STARTUP_MODE, (_event, mode: unknown) => {
    if (mode !== 'home' && mode !== 'restoreLastSession') {
      throw new Error(`Invalid startup mode: ${String(mode)}`);
    }

    // 实现方式：
    // 只改 LocalStore 中的 preferences.startupMode，
    // 然后通过 syncState 让 renderer 重新看到新偏好。
    localStore.setStartupMode(mode);
    syncState();
  });

  ipcMain.handle(IPC.TOGGLE_PIN_APP, (_event, appId: unknown) => {
    const validAppId = requireAppId(appId);

    // 实现方式：
    // 固定状态是纯偏好数据，不影响实例链路，只影响侧边栏入口展示。
    localStore.togglePinApp(validAppId);
    syncState();
  });

  ipcMain.handle(IPC.OPEN_EXTERNAL, (_event, url: unknown) => {
    if (typeof url !== 'string') {
      throw new Error(`Invalid url: ${String(url)}`);
    }

    // 实现方式：
    // renderer 通过 preload 请求主进程，由主进程代为调用 shell.openExternal。
    // 这样 shell 能力不会直接暴露到 renderer。
    return shell.openExternal(url);
  });
}
