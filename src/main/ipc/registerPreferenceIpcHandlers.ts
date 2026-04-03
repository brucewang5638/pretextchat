import { ipcMain } from "electron";
import { IPC } from "../../shared/constants";
import { localStore } from "../persistence/local-store";
import { updateManager } from "../runtime/update-manager";
import { viewManager } from "../workspace/view-manager";
import { requireAppId, syncState } from "./ipc-context";

export function registerPreferenceIpcHandlers(): void {
  ipcMain.handle(IPC.SET_STARTUP_MODE, (_event, mode: unknown) => {
    if (mode !== "home" && mode !== "restoreLastSession") {
      throw new Error(`Invalid startup mode: ${String(mode)}`);
    }

    localStore.setStartupMode(mode);
    syncState();
  });

  ipcMain.handle(IPC.SET_VIEW_RELEASE_POLICY, (_event, policy: unknown) => {
    if (
      policy !== "memorySaver" &&
      policy !== "balanced" &&
      policy !== "performance"
    ) {
      throw new Error(`Invalid view release policy: ${String(policy)}`);
    }

    localStore.setViewReleasePolicy(policy);
    viewManager.refreshReleasePolicy();
    syncState();
  });

  ipcMain.handle(IPC.TOGGLE_PIN_APP, (_event, appId: unknown) => {
    const validAppId = requireAppId(appId);
    localStore.togglePinApp(validAppId);
    syncState();
  });

  ipcMain.handle(IPC.UPDATE_SIDEBAR_ORDER, (_event, appIds: unknown) => {
    if (!Array.isArray(appIds)) {
      throw new Error("Invalid appIds");
    }
    localStore.updateSidebarOrder(appIds as string[]);
    syncState();
  });

  ipcMain.handle(IPC.CHECK_FOR_UPDATES, async () => {
    return updateManager.checkForUpdatesManually();
  });
}
