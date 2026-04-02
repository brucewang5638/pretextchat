// ============================================================
// LocalStore — electron-store 封装
// ============================================================
// 只存 workspace metadata + preferences。
// 不存：renderer 组件状态、AI 站点 Cookie（交给 session partition）。

import Store from "electron-store";
import type {
  PersistedWorkspaceState,
  Preferences,
  RecentInstanceEntry,
} from "../shared/types";

interface StoreSchema {
  workspace: PersistedWorkspaceState;
  preferences: Preferences;
}

const defaults: StoreSchema = {
  workspace: {
    instances: [],
    tabOrder: [],
    activeInstanceId: null,
  },
  preferences: {
    recentApps: [],
    recentInstances: [],
    startupMode: "home",
    restoreOnStartup: true,
  },
};

class LocalStore {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: "pretextchat-data",
      defaults,
    });
  }

  // ─── Workspace ──────────────────────────────────────────

  getWorkspaceState(): PersistedWorkspaceState {
    return this.store.get("workspace");
    // // 兼容旧版本本地数据：如果用户升级前保存的 workspace 缺字段，
    // // 这里统一补默认值，避免 renderer 读取时因为 undefined 直接白屏。
    // const ws = this.store.get('workspace') || {} as Partial<PersistedWorkspaceState>;
    // return {
    //   instances: ws.instances || [],
    //   tabOrder: ws.tabOrder || [],
    //   activeInstanceId: ws.activeInstanceId || null,
    // };
  }

  saveWorkspaceState(state: PersistedWorkspaceState): void {
    this.store.set("workspace", state);
  }

  // ─── Preferences ────────────────────────────────────────

  getPreferences(): Preferences {
    return this.store.get("preferences");
    // // 兼容旧版本 preferences：
    // // recentInstances / startupMode 是后加字段，旧用户本地配置里可能没有。
    // // 这里做归一化，保证 UI 层总能拿到完整结构。
    // const prefs = this.store.get('preferences') || {} as Partial<Preferences>;
    // return {
    //   recentApps: prefs.recentApps || [],
    //   recentInstances: prefs.recentInstances || [],
    //   startupMode: prefs.startupMode || 'home',
    //   restoreOnStartup: prefs.restoreOnStartup ?? true,
    // };
  }

  updateRecentApps(appId: string): void {
    const prefs = this.getPreferences();
    const recent = [
      appId,
      ...prefs.recentApps.filter((id) => id !== appId),
    ].slice(0, 10);
    this.store.set("preferences.recentApps", recent);
  }

  updateRecentInstance(entry: RecentInstanceEntry): void {
    const prefs = this.getPreferences();
    const recentInstances = [
      entry,
      ...prefs.recentInstances.filter(
        (item) => item.instanceId !== entry.instanceId,
      ),
    ].slice(0, 10);
    this.store.set("preferences.recentInstances", recentInstances);
  }

  removeRecentInstance(instanceId: string): void {
    const prefs = this.getPreferences();
    this.store.set(
      "preferences.recentInstances",
      prefs.recentInstances.filter((item) => item.instanceId !== instanceId),
    );
  }

  setRecentInstances(entries: RecentInstanceEntry[]): void {
    this.store.set("preferences.recentInstances", entries.slice(0, 10));
  }

  setRestoreOnStartup(value: boolean): void {
    this.store.set("preferences.restoreOnStartup", value);
    this.store.set(
      "preferences.startupMode",
      value ? "restoreLastSession" : "home",
    );
  }

  setStartupMode(value: Preferences["startupMode"]): void {
    this.store.set("preferences.startupMode", value);
    this.store.set(
      "preferences.restoreOnStartup",
      value === "restoreLastSession",
    );
  }
}

export const localStore = new LocalStore();
