// ============================================================
// AppRegistry — 预置 AI 应用目录
// ============================================================
// 读取 data/ai-apps.json，提供应用列表查询。

import { Application } from '../shared/types';
import aiAppsData from '../../data/ai-apps.json';
import { localStore } from './local-store';

const CUSTOM_APP_LAUNCHER: Application = {
  id: 'custom-app-launcher',
  name: '新增应用',
  icon: 'custom',
  startUrl: 'about:blank',
  category: '自定义应用',
  description: '把任意网页应用接入 PretextChat，本地保存后还能提交到云端审核。',
  source: 'builtin',
  navigation: {
    allowedHosts: [],
    allowedPopupHosts: [],
    externalHostnames: [],
    externalUrlPrefixes: [],
  },
};

class AppRegistry {
  private builtinApps: Map<string, Application>;

  constructor() {
    const apps = aiAppsData as Application[];
    this.builtinApps = new Map(
      apps.map((app) => [app.id, { ...app, source: 'builtin' as const }]),
    );
  }

  /** 获取所有启用的应用列表 */
  getAll(): Application[] {
    return [CUSTOM_APP_LAUNCHER, ...this.builtinApps.values(), ...this.getCustomApps()];
  }

  /** 根据 ID 获取单个应用 */
  get(appId: string): Application | undefined {
    if (appId === CUSTOM_APP_LAUNCHER.id) return CUSTOM_APP_LAUNCHER;
    return this.builtinApps.get(appId) ?? this.getCustomApps().find((app) => app.id === appId);
  }

  /** 检查应用是否存在 */
  has(appId: string): boolean {
    return this.get(appId) != null;
  }

  private getCustomApps(): Application[] {
    return localStore.getCustomApps().flatMap((app) => {
      try {
        const hostname = new URL(app.startUrl).hostname.toLowerCase();
        return [{
          id: app.id,
          name: app.name,
          icon: app.icon || 'custom',
          startUrl: app.startUrl,
          category: app.category || '自定义应用',
          description: app.description || '用户自定义接入的网页应用',
          source: 'custom',
          lastSubmittedAt: app.lastSubmittedAt,
          navigation: {
            allowedHosts: [hostname],
            allowedPopupHosts: [
              'accounts.google.com',
              '*.google.com',
              'github.com',
              '*.github.com',
              'login.live.com',
              'login.microsoftonline.com',
              'appleid.apple.com',
            ],
            externalHostnames: [],
            externalUrlPrefixes: [],
          },
        }];
      } catch {
        return [];
      }
    });
  }
}

export const appRegistry = new AppRegistry();
