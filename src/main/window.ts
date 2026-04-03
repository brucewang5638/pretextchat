// ============================================================
// Window — BrowserWindow 创建与管理
// ============================================================

import { BrowserWindow } from "electron";
import path from "node:path";
import { viewManager } from "./view-manager";
import { instanceStore } from "./instance-store";
import { BRAND_WINDOWS_ICON_RELATIVE_PATH } from "../shared/branding";

// Forge Vite plugin 注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const TAB_BAR_HEIGHT = 56; // 标签栏高度（像素）
const APP_ICON_PATH = path.join(__dirname, BRAND_WINDOWS_ICON_RELATIVE_PATH);

export function createMainWindow(
  shouldMinimizeToTrayOnClose: () => boolean,
): BrowserWindow {
  const syncContentBounds = () => {
    // 用 setImmediate 把布局更新放到当前事件循环尾部，
    // 避免窗口刚 resize 时同步读取尺寸导致抖动。
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
    autoHideMenuBar: true,
    icon: APP_ICON_PATH,
    // 隐藏窗口，等待内容加载完成再显示
    show: false,
    backgroundColor: "#0f0f12",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Windows / Linux 默认会显示原生菜单栏（File / Edit / View ...）。
  // 这里主动移除，让桌面端界面只保留我们自己设计的工作区层级。
  mainWindow.removeMenu();

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
  mainWindow.on("close", (event) => {
    if (shouldMinimizeToTrayOnClose()) {
      event.preventDefault();
      mainWindow.hide();
      return;
    }

    viewManager.syncAllCurrentUrls();
    instanceStore.saveSnapshot();
  });

  return mainWindow;
}

function updateContentBounds(window: BrowserWindow): void {
  const [width, height] = window.getContentSize();
  const SIDEBAR_WIDTH = 88; // 侧边栏宽度需与 renderer 视觉尺寸保持一致
  // renderer 自己负责画 Sidebar / TabBar；
  // main 进程的 WebContentsView 只占“真正网页内容区”。
  viewManager.setContentBounds({
    x: SIDEBAR_WIDTH,
    y: TAB_BAR_HEIGHT,
    width: width - SIDEBAR_WIDTH,
    height: height - TAB_BAR_HEIGHT,
  });
}
