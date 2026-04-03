// 这份文件只保留“应用生命周期骨架”：
// 1. app ready 后注册 IPC
// 2. 创建主窗口
// 3. 处理 macOS 常见的关闭/重新激活行为
// ============================================================
// Main Process Entry — PretextChat
// ============================================================

import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './window';
import { registerIpcHandlers } from './ipc-handlers';
import { eventLogger } from './event-logger';

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
  // 主进程先把跨进程接口注册好，再创建窗口；
  // 这样 renderer 初次启动时，window.api 调用不会撞到“还没注册 handler”的空窗期。
  registerIpcHandlers();
  mainWindow = createMainWindow();
  eventLogger.log('app_launched');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});
