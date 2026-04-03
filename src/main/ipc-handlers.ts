// ============================================================
// IPC Handlers — 统一注册
// ============================================================
// 当前集中管理主进程 IPC 入口。
// 每个入口必须做运行时校验。

import { ipcMain, BrowserWindow } from 'electron';
import { shell } from 'electron';
import { IPC } from '../shared/constants';
import type { Application, PersistedWorkspaceState, PersistedInstance, StateSnapshot } from '../shared/types';
import { isRendererManagedApp } from '../shared/app-runtime';
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
  if (!isRendererManagedApp(app) && !viewManager.hasView(instance.id)) {
    viewManager.create(instance.id, app);
  }
}

function showInstance(instanceId: string | null, app?: Application): void {
  viewManager.show(isRendererManagedApp(app) ? null : instanceId);
}

function markRendererManagedReady(instanceId: string, app?: Application): void {
  if (isRendererManagedApp(app)) {
    instanceStore.setHostingState(instanceId, 'rendererManaged');
    instanceStore.updateRuntimeStatus(instanceId, 'ready');
  }
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

  // 这就是当前主链路最重要的收敛点：
  // “激活实例”统一等价于
  // 1. rendererManaged 特例标记 ready
  // 2. 常规实例按需创建 native view
  // 3. 把正确的承载层显示出来
  markRendererManagedReady(instanceId, app);
  ensureNativeView(instance, app);
  showInstance(instanceId, app);
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

  ipcMain.handle(IPC.GET_APP_LIST, () => {
    return appRegistry.getAll();
  });

  ipcMain.handle(IPC.GET_INITIAL_STATE, () => {
    return buildStateSnapshot();
  });

  // ─── [instance] 实例生命周期 ──────────────────────────

  ipcMain.handle(IPC.CREATE_INSTANCE, (_event, appId: unknown) => {
    const validAppId = requireAppId(appId);
    const instance = instanceStore.createInstance(validAppId);
    activateInstance(instance.id);

    eventLogger.log('instance_created', { appId: validAppId, instanceId: instance.id });
    return instance;
  });

  ipcMain.handle(IPC.REOPEN_RECENT_INSTANCE, (_event, recentId: unknown) => {
    if (typeof recentId !== 'string') {
      throw new Error(`Invalid recent instance id: ${String(recentId)}`);
    }

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

    if (!isRendererManagedApp(app)) {
      viewManager.destroy(instanceId);
    }
    instanceStore.closeInstance(instanceId);
    eventLogger.log('instance_closed', { instanceId });

    showCurrentActiveInstance();
  });

  ipcMain.handle(IPC.SWITCH_INSTANCE, (_event, id: unknown) => {
    if (id === null) {
      instanceStore.switchTo(null);
      viewManager.show(null);
      eventLogger.log('instance_switched', { instanceId: null });
      return;
    }

    const instanceId = requireInstanceId(id);
    instanceStore.switchTo(instanceId);
    activateInstance(instanceId);
    eventLogger.log('instance_switched', { instanceId });
  });

  ipcMain.handle(IPC.RENAME_INSTANCE, (_event, id: unknown, title: unknown) => {
    const instanceId = requireInstanceId(id);
    if (typeof title !== 'string' || title.length === 0 || title.length > 100) {
      throw new Error('Invalid title: must be 1-100 characters');
    }

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
      showCurrentActiveInstance();
      eventLogger.log('restore_success', {
        instanceCount: snapshot.instances.length,
        activeId: snapshot.activeInstanceId,
      });
    }

    syncState();
    return snapshot;
  });

  // ─── [recent] 最近使用 ─────────────────────────────────

  ipcMain.handle(IPC.GET_RECENT, () => {
    const prefs = localStore.getPreferences();
    return {
      recentApps: prefs.recentApps,
      recentInstances: prefs.recentInstances,
    };
  });

  ipcMain.handle(IPC.SET_STARTUP_MODE, (_event, mode: unknown) => {
    if (mode !== 'home' && mode !== 'restoreLastSession') {
      throw new Error(`Invalid startup mode: ${String(mode)}`);
    }
    localStore.setStartupMode(mode);
    syncState();
  });

  ipcMain.handle(IPC.TOGGLE_PIN_APP, (_event, appId: unknown) => {
    const validAppId = requireAppId(appId);
    localStore.togglePinApp(validAppId);
    syncState();
  });

  ipcMain.handle(IPC.OPEN_EXTERNAL, (_event, url: unknown) => {
    if (typeof url !== 'string') {
      throw new Error(`Invalid url: ${String(url)}`);
    }
    return shell.openExternal(url);
  });
}
