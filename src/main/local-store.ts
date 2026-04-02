// ============================================================
// LocalStore — electron-store 封装
// ============================================================
// 只存 workspace metadata + preferences。
// 不存：renderer 组件状态、AI 站点 Cookie（交给 session partition）。

import Store from 'electron-store';
import type { PersistedWorkspaceState, Preferences } from '../shared/types';

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

  setRestoreOnStartup(value: boolean): void {
    this.store.set('preferences.restoreOnStartup', value);
  }
}

export const localStore = new LocalStore();
