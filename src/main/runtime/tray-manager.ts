import { Menu, Tray, nativeImage, app, type BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const TRAY_ICON_RELATIVE_CANDIDATES =
  process.platform === 'win32'
    ? [
        'public/images/branding/icon.ico',
        '.vite/renderer/main_window/images/branding/icon.ico',
        'public/images/branding/pretextchat-logo.svg',
        '.vite/renderer/main_window/images/branding/pretextchat-logo.svg',
      ]
    : [
        'public/images/branding/pretextchat-logo.svg',
        '.vite/renderer/main_window/images/branding/pretextchat-logo.svg',
        'public/images/branding/icon.ico',
        '.vite/renderer/main_window/images/branding/icon.ico',
      ];

function createFallbackTrayImage() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stop-color="#102033"/>
          <stop offset="1" stop-color="#1F5F78"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bg)"/>
      <rect x="15" y="15" width="10" height="34" rx="5" fill="#F8FBFF"/>
      <path d="M22 15H34.5C43.0604 15 50 21.9396 50 30.5C50 39.0604 43.0604 46 34.5 46H26V37.5H34C38.6944 37.5 42.5 33.6944 42.5 29C42.5 24.3056 38.6944 20.5 34 20.5H22V15Z" fill="#F8FBFF"/>
      <rect x="34" y="24" width="15" height="3.5" rx="1.75" fill="#6EE7D8"/>
      <rect x="34" y="31" width="11" height="3.5" rx="1.75" fill="#A7C4D6"/>
      <rect x="34" y="38" width="8" height="3.5" rx="1.75" fill="#A7C4D6"/>
    </svg>
  `.trim();

  return nativeImage
    .createFromDataURL(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
    .resize({ width: 18, height: 18 });
}

function loadTrayImage() {
  const roots = Array.from(
    new Set([
      app.getAppPath(),
      process.resourcesPath,
      path.join(process.resourcesPath, 'app.asar'),
    ]),
  );

  for (const root of roots) {
    for (const relativePath of TRAY_ICON_RELATIVE_CANDIDATES) {
      const absolutePath = path.join(root, relativePath);
      if (!fs.existsSync(absolutePath)) {
        continue;
      }

      const image = nativeImage.createFromPath(absolutePath);
      if (!image.isEmpty()) {
        return {
          image: image.resize({ width: 18, height: 18 }),
          source: absolutePath,
        };
      }
    }
  }

  return {
    image: createFallbackTrayImage(),
    source: 'inline-fallback',
  };
}

class TrayManager {
  private tray: Tray | null = null;

  init(getMainWindow: () => BrowserWindow | null, onQuit: () => void): void {
    if (this.tray) {
      return;
    }

    const { image: trayIcon, source } = loadTrayImage();

    this.tray = new Tray(trayIcon);
    console.log(`[TrayManager] 已加载托盘图标: ${source}`);
    this.tray.setToolTip('PretextChat');

    const showMainWindow = () => {
      const mainWindow = getMainWindow();
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    };

    this.tray.on('click', showMainWindow);
    this.tray.on('double-click', showMainWindow);
    this.tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: '显示 PretextChat',
          click: showMainWindow,
        },
        {
          label: '退出 PretextChat',
          click: onQuit,
        },
      ]),
    );
  }

  destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }
}

export const trayManager = new TrayManager();
