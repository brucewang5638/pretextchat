// ============================================================
// Main Process Entry — PretextChat
// ============================================================

import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { createMainWindow } from './window';
import { registerIpcHandlers } from './ipc-handlers';
import { eventLogger } from './event-logger';

// Windows installer shortcuts
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
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
