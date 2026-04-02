// ============================================================
// LocalStore — electron-store 封装
// ============================================================
// 只存 workspace metadata + preferences。
// 不存：renderer 组件状态、AI 站点 Cookie（交给 session partition）。

import Store from 'electron-store';
import type { PersistedWorkspaceState, Preferences, RecentInstanceEntry } from '../shared/types';

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
    startupMode: 'home',
    restoreOnStartup: true,
  },
};

class LocalStore {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'pretextchat-data',
      defaults,
    });
  }

  // ─── Workspace ──────────────────────────────────────────

  getWorkspaceState(): PersistedWorkspaceState {
    return this.store.get('workspace');
  }

  saveWorkspaceState(state: PersistedWorkspaceState): void {
    this.store.set('workspace', state);
  }

  // ─── Preferences ────────────────────────────────────────

  getPreferences(): Preferences {
    return this.store.get('preferences');
  }

  updateRecentApps(appId: string): void {
    const prefs = this.getPreferences();
    const recent = [appId, ...prefs.recentApps.filter((id) => id !== appId)].slice(0, 10);
    this.store.set('preferences.recentApps', recent);
  }

  updateRecentInstance(entry: RecentInstanceEntry): void {
    const prefs = this.getPreferences();
    const recentInstances = [
      entry,
      ...prefs.recentInstances.filter((item) => item.instanceId !== entry.instanceId),
    ].slice(0, 10);
    this.store.set('preferences.recentInstances', recentInstances);
  }

  removeRecentInstance(instanceId: string): void {
    const prefs = this.getPreferences();
    this.store.set(
      'preferences.recentInstances',
      prefs.recentInstances.filter((item) => item.instanceId !== instanceId),
    );
  }

  setRecentInstances(entries: RecentInstanceEntry[]): void {
    this.store.set('preferences.recentInstances', entries.slice(0, 10));
  }

  setRestoreOnStartup(value: boolean): void {
    this.store.set('preferences.restoreOnStartup', value);
    this.store.set('preferences.startupMode', value ? 'restoreLastSession' : 'home');
  }

  setStartupMode(value: Preferences['startupMode']): void {
    this.store.set('preferences.startupMode', value);
    this.store.set('preferences.restoreOnStartup', value === 'restoreLastSession');
  }
}

export const localStore = new LocalStore();
