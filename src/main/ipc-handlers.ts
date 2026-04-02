// ============================================================
// IPC Handlers — 统一注册
// ============================================================
// Phase 1 单文件。拆分阈值：>8 handler 或 >3 职责域时拆为 ipc/ 目录。
// 每个入口必须做运行时校验。

import { ipcMain, BrowserWindow } from 'electron';
import { IPC } from '../shared/constants';
import type { PersistedWorkspaceState, StateSnapshot } from '../shared/types';
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
  const snapshot = buildStateSnapshot();
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(IPC.STATE_SYNC, snapshot);
  });
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
    // 校验
    if (typeof appId !== 'string' || !appRegistry.has(appId)) {
      throw new Error(`Invalid appId: ${String(appId)}`);
    }

    const instance = instanceStore.createInstance(appId);
    const app = appRegistry.get(appId)!;

    if (app.renderMode === 'webview') {
      viewManager.show(null);
      instanceStore.updateRuntimeStatus(instance.id, 'ready');
    } else {
      // 创建 WebContentsView（非懒创建，因为是用户主动操作）
      viewManager.create(instance.id, app);
      viewManager.show(instance.id);
    }

    eventLogger.log('instance_created', { appId, instanceId: instance.id });
    return instance;
  });

  ipcMain.handle(IPC.REOPEN_RECENT_INSTANCE, (_event, recentId: unknown) => {
    if (typeof recentId !== 'string') {
      throw new Error(`Invalid recent instance id: ${String(recentId)}`);
    }

    const existing = instanceStore.getInstance(recentId);
    const instance = instanceStore.reopenRecentInstance(recentId);
    const app = appRegistry.get(instance.applicationId);
    if (!app) {
      throw new Error(`Unknown appId: ${instance.applicationId}`);
    }

    if (!existing) {
      if (app.renderMode === 'webview') {
        instanceStore.updateRuntimeStatus(instance.id, 'ready');
      } else {
        viewManager.create(instance.id, app);
      }
    }
    viewManager.show(app.renderMode === 'webview' ? null : instance.id);
    syncState();
    return instance;
  });

  ipcMain.handle(IPC.CLOSE_INSTANCE, (_event, id: unknown) => {
    if (typeof id !== 'string' || !instanceStore.has(id)) {
      throw new Error(`Invalid instanceId: ${String(id)}`);
    }

    const instance = instanceStore.getInstance(id);
    const app = instance ? appRegistry.get(instance.applicationId) : undefined;

    if (app?.renderMode !== 'webview') {
      viewManager.destroy(id);
    }
    instanceStore.closeInstance(id);
    eventLogger.log('instance_closed', { instanceId: id });

    // 如果还有实例，切换并显示
    const state = instanceStore.getWorkspaceState();
    if (state.activeInstanceId) {
      // 懒创建：如果 View 不存在则创建
      if (!viewManager.hasView(state.activeInstanceId)) {
        const inst = instanceStore.getInstance(state.activeInstanceId);
        if (inst) {
          const app = appRegistry.get(inst.applicationId);
          if (app && app.renderMode !== 'webview') viewManager.create(inst.id, app);
        }
      }
      const activeInstance = instanceStore.getInstance(state.activeInstanceId);
      const activeApp = activeInstance ? appRegistry.get(activeInstance.applicationId) : undefined;
      viewManager.show(activeApp?.renderMode === 'webview' ? null : state.activeInstanceId);
    }
  });

  ipcMain.handle(IPC.SWITCH_INSTANCE, (_event, id: unknown) => {
    if (id === null) {
      instanceStore.switchTo(null);
      viewManager.show(null);
      eventLogger.log('instance_switched', { instanceId: null });
      return;
    }

    if (typeof id !== 'string' || !instanceStore.has(id)) {
      throw new Error(`Invalid instanceId: ${String(id)}`);
    }

    instanceStore.switchTo(id);

    const inst = instanceStore.getInstance(id);
    const app = inst ? appRegistry.get(inst.applicationId) : undefined;
    if (app?.renderMode === 'webview') {
      instanceStore.updateRuntimeStatus(id, 'ready');
      viewManager.show(null);
      eventLogger.log('instance_switched', { instanceId: id });
      return;
    }

    // 懒创建：如果目标实例的 View 还不存在（恢复场景）
    if (!viewManager.hasView(id) && inst && app) {
      viewManager.create(inst.id, app);
    }

    viewManager.show(id);
    eventLogger.log('instance_switched', { instanceId: id });
  });

  ipcMain.handle(IPC.RENAME_INSTANCE, (_event, id: unknown, title: unknown) => {
    if (typeof id !== 'string' || !instanceStore.has(id)) {
      throw new Error(`Invalid instanceId: ${String(id)}`);
    }
    if (typeof title !== 'string' || title.length === 0 || title.length > 100) {
      throw new Error('Invalid title: must be 1-100 characters');
    }

    instanceStore.rename(id, title);
    eventLogger.log('instance_renamed', { instanceId: id, title });
  });

  // ─── [session] 会话恢复 ────────────────────────────────

  ipcMain.handle(IPC.RESTORE_SESSION, () => {
    const snapshot = instanceStore.restoreSnapshot();

    if (snapshot && !isValidWorkspaceState(snapshot)) {
      eventLogger.log('restore_failed', { reason: 'corrupt_snapshot' });
      return null;
    }

    if (snapshot && snapshot.instances.length > 0) {
      // 懒恢复：只为激活实例创建 View
      if (snapshot.activeInstanceId) {
        const inst = snapshot.instances.find((i) => i.id === snapshot.activeInstanceId);
        if (inst) {
          const app = appRegistry.get(inst.applicationId);
          if (app) {
            if (app.renderMode === 'webview') {
              instanceStore.updateRuntimeStatus(inst.id, 'ready');
              viewManager.show(null);
            } else {
              viewManager.create(inst.id, app);
              viewManager.show(inst.id);
            }
          }
        }
      }
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
    if (typeof appId !== 'string' || !appRegistry.has(appId)) {
      throw new Error(`Invalid appId: ${String(appId)}`);
    }
    localStore.togglePinApp(appId);
    syncState();
  });
}
