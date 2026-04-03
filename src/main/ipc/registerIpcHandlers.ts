// ============================================================
// IPC Registration — 主进程跨进程接口总装配
// ============================================================
// 这里只负责把不同域的 IPC 注册模块串起来，
// 避免把所有 handler 长时间堆在一个文件里。

import { instanceStore } from "../workspace/instance-store";
import { syncState } from "./ipc-context";
import { registerCatalogIpcHandlers } from "./registerCatalogIpcHandlers";
import { registerCustomAppIpcHandlers } from "./registerCustomAppIpcHandlers";
import { registerPreferenceIpcHandlers } from "./registerPreferenceIpcHandlers";
import { registerSystemIpcHandlers } from "./registerSystemIpcHandlers";
import { registerWorkspaceIpcHandlers } from "./registerWorkspaceIpcHandlers";

export function registerIpcHandlers(): void {
  instanceStore.onChange(() => syncState());
  registerCatalogIpcHandlers();
  registerWorkspaceIpcHandlers();
  registerPreferenceIpcHandlers();
  registerCustomAppIpcHandlers();
  registerSystemIpcHandlers();
}
