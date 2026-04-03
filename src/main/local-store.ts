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
    pinnedAppIds: [],
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
    // 持久化层只保存“可恢复的 metadata”，不直接保存真实网页运行时对象。
    return this.store.get("workspace");
  }

  saveWorkspaceState(state: PersistedWorkspaceState): void {
    this.store.set("workspace", state);
  }

  // ─── Preferences ────────────────────────────────────────

  getPreferences(): Preferences {
    const prefs = this.store.get("preferences") || {} as Partial<Preferences>;
    return {
      recentApps: prefs.recentApps || [],
      recentInstances: prefs.recentInstances || [],
      startupMode: prefs.startupMode || 'home',
      pinnedAppIds: prefs.pinnedAppIds || [],
    };
  }

  updateRecentApps(appId: string): void {
    const prefs = this.getPreferences();
    // 最近使用列表通过“头插 + 去重 + 截断”维护，
    // 这样既稳定又便于 UI 直接显示。
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

  setStartupMode(value: Preferences["startupMode"]): void {
    this.store.set("preferences.startupMode", value);
  }

  togglePinApp(appId: string): void {
    const prefs = this.getPreferences();
    const pinned = prefs.pinnedAppIds;
    if (pinned.includes(appId)) {
      this.store.set("preferences.pinnedAppIds", pinned.filter(id => id !== appId));
    } else {
      this.store.set("preferences.pinnedAppIds", [...pinned, appId]);
    }
  }
}

export const localStore = new LocalStore();
