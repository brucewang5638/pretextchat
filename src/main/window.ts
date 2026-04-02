// ============================================================
// Window — BrowserWindow 创建与管理
// ============================================================

import { BrowserWindow } from 'electron';
import path from 'node:path';
import { viewManager } from './view-manager';
import { instanceStore } from './instance-store';

// Forge Vite plugin 注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const TAB_BAR_HEIGHT = 40; // 标签栏高度（像素）

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'PretextChat',
    show: false,
    backgroundColor: '#0f0f12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
    },
  });

  // 加载 renderer
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // 设置 ViewManager 的主窗口引用和初始内容区域
  viewManager.setMainWindow(mainWindow);
  updateContentBounds(mainWindow);

  // 响应窗口 resize，更新 WebContentsView 布局
  mainWindow.on('resize', () => {
    updateContentBounds(mainWindow);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.center();
    mainWindow.show();
    mainWindow.focus();
  });

  // 关闭前保存会话快照
  mainWindow.on('close', () => {
    instanceStore.saveSnapshot();
  });

  return mainWindow;
}

function updateContentBounds(window: BrowserWindow): void {
  const [width, height] = window.getContentSize();
  viewManager.setContentBounds({
    x: 0,
    y: TAB_BAR_HEIGHT,
    width,
    height: height - TAB_BAR_HEIGHT,
  });
}
