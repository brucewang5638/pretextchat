import { app } from "electron";
import type { LaunchAtLoginState } from "../../shared/types";
import { localStore } from "../persistence/local-store";

const SUPPORTED_PLATFORMS = new Set(["darwin", "win32", "linux"]);

function isSupportedPlatform(): boolean {
  return SUPPORTED_PLATFORMS.has(process.platform);
}

function getEnvironmentHint(): string | null {
  if (!app.isPackaged) {
    return "开发环境下可用，但打包后体验更稳定";
  }

  if (process.platform === "linux") {
    return "Linux 不同桌面环境的登录项支持程度可能不同";
  }

  return null;
}

function buildState(enabled: boolean, note?: string | null): LaunchAtLoginState {
  const parts = [enabled ? "已开启开机自启" : "已关闭开机自启"];
  if (note) {
    parts.push(note);
  }

  return {
    supported: isSupportedPlatform(),
    enabled,
    message: parts.join(" · "),
  };
}

export function getLaunchAtLoginState(): LaunchAtLoginState {
  if (!isSupportedPlatform()) {
    return {
      supported: false,
      enabled: false,
      message: "当前平台暂不支持开机自启",
    };
  }

  const settings = app.getLoginItemSettings();
  return buildState(settings.openAtLogin, getEnvironmentHint());
}

export function applyLaunchAtLogin(enabled: boolean): LaunchAtLoginState {
  if (!isSupportedPlatform()) {
    localStore.setLaunchAtLoginConfigured(true);
    return {
      supported: false,
      enabled: false,
      message: "当前平台暂不支持开机自启",
    };
  }

  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: false,
    });
    localStore.setLaunchAtLogin(enabled);
    localStore.setLaunchAtLoginConfigured(true);

    const settings = app.getLoginItemSettings();
    return buildState(settings.openAtLogin, getEnvironmentHint());
  } catch (error) {
    const current = getLaunchAtLoginState();
    return {
      ...current,
      message: error instanceof Error
        ? `开机自启设置失败：${error.message}`
        : "开机自启设置失败",
    };
  }
}

export function syncLaunchAtLoginPreference(): LaunchAtLoginState {
  if (!isSupportedPlatform()) {
    return getLaunchAtLoginState();
  }

  const preferences = localStore.getPreferences();
  if (!preferences.launchAtLoginConfigured) {
    const current = getLaunchAtLoginState();
    localStore.setLaunchAtLogin(current.enabled);
    localStore.setLaunchAtLoginConfigured(true);
    return current;
  }

  try {
    app.setLoginItemSettings({
      openAtLogin: preferences.launchAtLogin,
      openAsHidden: false,
    });
  } catch {
    return getLaunchAtLoginState();
  }

  return getLaunchAtLoginState();
}
