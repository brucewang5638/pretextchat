import { ipcMain, session } from "electron";
import { IPC } from "../../shared/constants";
import { getAppPartition } from "../../shared/app-runtime";
import { localStore } from "../persistence/local-store";
import { appRegistry } from "../catalog/app-registry";
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

  ipcMain.handle(IPC.CLEAR_EMBEDDED_SITE_DATA, async () => {
    const partitions = Array.from(
      new Set(
        appRegistry
          .getAll()
          .filter((app) => app.startUrl !== "about:blank")
          .map(() => getAppPartition()),
      ),
    );

    viewManager.releaseAll();

    try {
      await Promise.all(
        partitions.map(async (partition) => {
          const sessionRef = session.fromPartition(partition);
          await sessionRef.clearAuthCache();
          await sessionRef.clearCache();
          await sessionRef.clearStorageData();
          await sessionRef.cookies.flushStore();
          await sessionRef.flushStorageData();
        }),
      );

      syncState();
      return {
        status: "success" as const,
        message: "所有嵌入应用的登录态、缓存和离线数据已清理。",
      };
    } catch (error) {
      syncState();
      return {
        status: "error" as const,
        message:
          error instanceof Error
            ? `清理站点数据失败：${error.message}`
            : "清理站点数据失败。",
      };
    }
  });
}
