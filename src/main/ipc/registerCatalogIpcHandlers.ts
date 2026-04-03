import { ipcMain } from "electron";
import { IPC } from "../../shared/constants";
import { buildStateSnapshot } from "./ipc-context";

export function registerCatalogIpcHandlers(): void {
  ipcMain.handle(IPC.GET_INITIAL_STATE, () => {
    return buildStateSnapshot();
  });
}
