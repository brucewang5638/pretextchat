// ============================================================
// Window — BrowserWindow 创建与管理
// ============================================================

import { BrowserWindow } from "electron";
import path from "node:path";
import { viewManager } from "./view-manager";
import { instanceStore } from "./instance-store";

// Forge Vite plugin 注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const TAB_BAR_HEIGHT = 40; // 标签栏高度（像素）

export function createMainWindow(): BrowserWindow {
  const syncContentBounds = () => {
    setImmediate(() => {
      if (!mainWindow.isDestroyed()) {
        updateContentBounds(mainWindow);
      }
    });
  };

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "PretextChat",
    // 隐藏窗口，等待内容加载完成再显示
    show: false,
    backgroundColor: "#0f0f12",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false,
      // 当前仍需兼容少量 renderer <webview> 特例，因此保留 webviewTag。
      // 但主窗口本身继续使用标准同源与安全内容策略。
      webSecurity: true,
      webviewTag: true,
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
  syncContentBounds();

  mainWindow.webContents.on(
    "console-message",
    (event, level, message, line, sourceId) => {
      console.log(
        `[Renderer] [${level}] ${message} (line: ${line}, source: ${sourceId})`,
      );
    },
  );

  // 响应窗口 resize，更新 WebContentsView 布局
  mainWindow.on("resize", syncContentBounds);
  mainWindow.on("maximize", syncContentBounds);
  mainWindow.on("unmaximize", syncContentBounds);
  mainWindow.on("enter-full-screen", syncContentBounds);
  mainWindow.on("leave-full-screen", syncContentBounds);

  mainWindow.once("ready-to-show", () => {
    syncContentBounds();
    mainWindow.center();
    mainWindow.show();
    mainWindow.focus();
  });

  // 关闭前保存会话快照
  mainWindow.on("close", () => {
    instanceStore.saveSnapshot();
  });

  return mainWindow;
}

function updateContentBounds(window: BrowserWindow): void {
  const [width, height] = window.getContentSize();
  const SIDEBAR_WIDTH = 68; // 窄侧边栏宽度
  viewManager.setContentBounds({
    x: SIDEBAR_WIDTH,
    y: TAB_BAR_HEIGHT,
    width: width - SIDEBAR_WIDTH,
    height: height - TAB_BAR_HEIGHT,
  });
}
