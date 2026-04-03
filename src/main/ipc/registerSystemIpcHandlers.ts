import { ipcMain, shell } from "electron";
import { IPC } from "../../shared/constants";

export function registerSystemIpcHandlers(): void {
  ipcMain.handle(IPC.OPEN_EXTERNAL, (_event, url: unknown) => {
    if (typeof url !== "string") {
      throw new Error(`Invalid url: ${String(url)}`);
    }

    return shell.openExternal(url);
  });
}
