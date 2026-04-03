import fs from 'node:fs';
import path from 'node:path';
import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { UpdateCheckResult } from '../shared/types';

const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

class UpdateManager {
  private initialized = false;
  private promptOpen = false;
  private manualCheckInFlight: Promise<UpdateCheckResult> | null = null;
  private mainWindow: BrowserWindow | null = null;

  private canUseAutoUpdater(): boolean {
    if (!app.isPackaged || process.platform !== 'win32') {
      return false;
    }

    const updateConfigPath = path.join(process.resourcesPath, 'app-update.yml');
    return fs.existsSync(updateConfigPath);
  }

  init(mainWindow: BrowserWindow): void {
    // 当前自动更新只接入 Windows 的 electron-builder 分发链路。
    if (this.initialized || !this.canUseAutoUpdater()) {
      return;
    }

    this.initialized = true;
    this.mainWindow = mainWindow;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = app.getVersion().includes('-');

    autoUpdater.on('error', (error) => {
      console.error('[AutoUpdate] Failed to check for updates:', error);
    });

    autoUpdater.on('update-available', (info) => {
      console.log('[AutoUpdate] Update available:', info.version);
    });

    autoUpdater.on('update-not-available', () => {
      console.log('[AutoUpdate] App is up to date');
    });

    autoUpdater.on('update-downloaded', async (info) => {
      if (this.promptOpen) return;
      this.promptOpen = true;

      try {
        const result = await dialog.showMessageBox(this.mainWindow ?? mainWindow, {
          type: 'info',
          buttons: ['Restart And Update', 'Later'],
          defaultId: 0,
          cancelId: 1,
          noLink: true,
          title: 'Update Ready',
          message: 'A new version of PretextChat has been downloaded.',
          detail: `Version ${info.version} is ready to install. Restart the app to apply the update.`,
        });

        if (result.response === 0) {
          setImmediate(() => {
            autoUpdater.quitAndInstall();
          });
        }
      } finally {
        this.promptOpen = false;
      }
    });

    this.scheduleChecks();
  }

  async checkForUpdatesManually(): Promise<UpdateCheckResult> {
    if (!app.isPackaged || process.platform !== 'win32') {
      return {
        status: 'unsupported',
        message: '仅已安装的 Windows 版本支持客户端内检查更新。',
      };
    }

    if (!this.canUseAutoUpdater()) {
      return {
        status: 'unsupported',
        message: '当前版本未包含自动更新配置，请使用安装版客户端检查更新。',
      };
    }

    if (this.manualCheckInFlight) {
      return this.manualCheckInFlight;
    }

    this.manualCheckInFlight = new Promise<UpdateCheckResult>((resolve) => {
      const cleanup = () => {
        autoUpdater.removeListener('update-available', handleAvailable);
        autoUpdater.removeListener('update-not-available', handleNotAvailable);
        autoUpdater.removeListener('update-downloaded', handleDownloaded);
        autoUpdater.removeListener('error', handleError);
      };

      const finish = (result: UpdateCheckResult) => {
        cleanup();
        this.manualCheckInFlight = null;
        resolve(result);
      };

      const handleAvailable = (info: { version: string }) => {
        finish({
          status: 'available',
          version: info.version,
          message: `发现新版本 ${info.version}，正在后台下载。`,
        });
      };

      const handleNotAvailable = () => {
        finish({
          status: 'not-available',
          version: app.getVersion(),
          message: `当前已是最新版本 (${app.getVersion()})。`,
        });
      };

      const handleDownloaded = (info: { version: string }) => {
        finish({
          status: 'downloaded',
          version: info.version,
          message: `新版本 ${info.version} 已下载完成，重启应用即可安装。`,
        });
      };

      const handleError = (error: Error) => {
        finish({
          status: 'error',
          message: error.message || '检查更新失败。',
        });
      };

      autoUpdater.once('update-available', handleAvailable);
      autoUpdater.once('update-not-available', handleNotAvailable);
      autoUpdater.once('update-downloaded', handleDownloaded);
      autoUpdater.once('error', handleError);

      void autoUpdater.checkForUpdates().catch((error: unknown) => {
        handleError(error instanceof Error ? error : new Error(String(error)));
      });
    });

    return this.manualCheckInFlight;
  }

  private scheduleChecks(): void {
    void autoUpdater.checkForUpdates().catch((error: unknown) => {
      console.error('[AutoUpdate] Initial update check failed:', error);
    });

    const timer = setInterval(() => {
      void autoUpdater.checkForUpdates().catch((error: unknown) => {
        console.error('[AutoUpdate] Scheduled update check failed:', error);
      });
    }, UPDATE_CHECK_INTERVAL_MS);

    timer.unref();
  }
}

export const updateManager = new UpdateManager();
