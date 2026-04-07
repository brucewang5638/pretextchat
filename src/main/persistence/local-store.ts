// ============================================================
// LocalStore — electron-store 封装
// ============================================================
// 只存 workspace metadata + preferences。
// 不存：renderer 组件状态、AI 站点 Cookie（交给 session partition）。

import Store from "electron-store";
import type {
  CustomAppRecord,
  PersistedWorkspaceState,
  Preferences,
  RecentInstanceEntry,
} from "../../shared/types";

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
    launchAtLogin: false,
    launchAtLoginConfigured: false,
    pinnedAppIds: [],
    viewReleasePolicy: "balanced",
    customApps: [],
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
      launchAtLogin: prefs.launchAtLogin || false,
      launchAtLoginConfigured: prefs.launchAtLoginConfigured || false,
      pinnedAppIds: prefs.pinnedAppIds || [],
      customSidebarOrder: prefs.customSidebarOrder || [],
      viewReleasePolicy: prefs.viewReleasePolicy || 'balanced',
      customApps: prefs.customApps || [],
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

  setLaunchAtLogin(value: boolean): void {
    this.store.set("preferences.launchAtLogin", value);
  }

  setLaunchAtLoginConfigured(value: boolean): void {
    this.store.set("preferences.launchAtLoginConfigured", value);
  }

  setViewReleasePolicy(value: NonNullable<Preferences["viewReleasePolicy"]>): void {
    this.store.set("preferences.viewReleasePolicy", value);
  }

  getCustomApps(): CustomAppRecord[] {
    return this.getPreferences().customApps || [];
  }

  upsertCustomApp(app: CustomAppRecord): void {
    const customApps = this.getCustomApps();
    const existingIndex = customApps.findIndex((item) => item.id === app.id);

    if (existingIndex === -1) {
      this.store.set("preferences.customApps", [...customApps, app]);
      return;
    }

    const nextApps = [...customApps];
    nextApps[existingIndex] = app;
    this.store.set("preferences.customApps", nextApps);
  }

  removeCustomApp(appId: string): void {
    this.store.set(
      "preferences.customApps",
      this.getCustomApps().filter((item) => item.id !== appId),
    );
  }

  markCustomAppSubmitted(appId: string, submittedAt: number): void {
    const app = this.getCustomApps().find((item) => item.id === appId);
    if (!app) return;

    this.upsertCustomApp({
      ...app,
      lastSubmittedAt: submittedAt,
      updatedAt: submittedAt,
    });
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

  updateSidebarOrder(appIds: string[]): void {
    this.store.set("preferences.customSidebarOrder", appIds);
  }
}

export const localStore = new LocalStore();
