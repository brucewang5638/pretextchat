import { Menu, Tray, nativeImage, type BrowserWindow } from 'electron';
import path from 'node:path';
import { BRAND_WINDOWS_ICON_RELATIVE_PATH } from '../shared/branding';

const TRAY_ICON_PATH = path.join(__dirname, BRAND_WINDOWS_ICON_RELATIVE_PATH);

class TrayManager {
  private tray: Tray | null = null;

  init(getMainWindow: () => BrowserWindow | null, onQuit: () => void): void {
    if (this.tray) {
      return;
    }

    const trayIcon = nativeImage.createFromPath(TRAY_ICON_PATH).resize({
      width: 16,
      height: 16,
    });
    this.tray = new Tray(trayIcon);
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
