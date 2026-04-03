import { ipcMain } from "electron";
import { IPC } from "../../shared/constants";
import { eventLogger } from "../runtime/event-logger";
import { instanceStore } from "../workspace/instance-store";
import { viewManager } from "../workspace/view-manager";
import {
  activateInstance,
  getAppForInstance,
  isValidWorkspaceState,
  requireAppId,
  requireInstanceId,
  showCurrentActiveInstance,
  syncState,
} from "./ipc-context";

export function registerWorkspaceIpcHandlers(): void {
  ipcMain.handle(IPC.CREATE_INSTANCE, (_event, appId: unknown) => {
    const validAppId = requireAppId(appId);
    const instance = instanceStore.createInstance(validAppId);

    activateInstance(instance.id);
    eventLogger.log("instance_created", {
      appId: validAppId,
      instanceId: instance.id,
    });
    return instance;
  });

  ipcMain.handle(IPC.REOPEN_RECENT_INSTANCE, (_event, recentId: unknown) => {
    if (typeof recentId !== "string") {
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

    if (app) viewManager.destroy(instanceId);
    instanceStore.closeInstance(instanceId);
    eventLogger.log("instance_closed", { instanceId });

    showCurrentActiveInstance();
  });

  ipcMain.handle(IPC.SWITCH_INSTANCE, (_event, id: unknown) => {
    if (id === null) {
      instanceStore.switchTo(null);
      viewManager.show(null);
      eventLogger.log("instance_switched", { instanceId: null });
      return;
    }

    const instanceId = requireInstanceId(id);
    instanceStore.switchTo(instanceId);
    activateInstance(instanceId);
    eventLogger.log("instance_switched", { instanceId });
  });

  ipcMain.handle(IPC.RENAME_INSTANCE, (_event, id: unknown, title: unknown) => {
    const instanceId = requireInstanceId(id);
    if (typeof title !== "string" || title.length === 0 || title.length > 100) {
      throw new Error("Invalid title: must be 1-100 characters");
    }

    instanceStore.rename(instanceId, title);
    eventLogger.log("instance_renamed", { instanceId, title });
  });

  ipcMain.handle(IPC.RESTORE_SESSION, () => {
    const snapshot = instanceStore.restoreSnapshot();

    if (snapshot && !isValidWorkspaceState(snapshot)) {
      eventLogger.log("restore_failed", { reason: "corrupt_snapshot" });
      return null;
    }

    if (snapshot && snapshot.instances.length > 0) {
      showCurrentActiveInstance();
      eventLogger.log("restore_success", {
        instanceCount: snapshot.instances.length,
        activeId: snapshot.activeInstanceId,
      });
    }

    syncState();
    return snapshot;
  });
}
