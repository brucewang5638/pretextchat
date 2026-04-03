// 这份文件只保留“应用生命周期骨架”：
// 1. app ready 后注册 IPC
// 2. 创建主窗口
// 3. 处理 macOS 常见的关闭/重新激活行为
// ============================================================
// Main Process Entry — PretextChat
// ============================================================

import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './app/createMainWindow';
import { registerIpcHandlers } from './ipc/registerIpcHandlers';
import { eventLogger } from './runtime/event-logger';
import { updateManager } from './runtime/update-manager';
import { trayManager } from './runtime/tray-manager';

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow(() => !isQuitting);
    updateManager.init(mainWindow);
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.focus();
  mainWindow.setAlwaysOnTop(false);
  mainWindow.focus();
}

app.on('ready', () => {
  // 主进程先把跨进程接口注册好，再创建窗口；
  // 这样 renderer 初次启动时，window.api 调用不会撞到“还没注册 handler”的空窗期。
  registerIpcHandlers();
  mainWindow = createMainWindow(() => !isQuitting);
  updateManager.init(mainWindow);
  trayManager.init(() => mainWindow, () => {
    isQuitting = true;
    app.quit();
  });
  eventLogger.log('app_launched');
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});

app.on('activate', () => {
  showMainWindow();
});

app.on('second-instance', () => {
  showMainWindow();
});

app.on('quit', () => {
  trayManager.destroy();
});
