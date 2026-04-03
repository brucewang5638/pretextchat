// ============================================================
// AppRegistry — 预置 AI 应用目录
// ============================================================
// 读取 data/ai-apps.json，提供应用列表查询。

import { Application } from '../shared/types';
import aiAppsData from '../../data/ai-apps.json';

function validateApp(app: Application): Application {
  if (app.renderMode === 'webview' && !app.renderModeReason) {
    throw new Error(`App "${app.id}" uses webview without renderModeReason`);
  }

  if (app.renderMode !== 'webview' && app.renderModeReason) {
    throw new Error(`App "${app.id}" has renderModeReason without webview renderMode`);
  }

  return app;
}

class AppRegistry {
  private apps: Map<string, Application>;

  constructor() {
    const apps = (aiAppsData as Application[]).map(validateApp);
    this.apps = new Map(apps.map((app) => [app.id, app]));
  }

  /** 获取所有启用的应用列表 */
  getAll(): Application[] {
    return Array.from(this.apps.values());
  }

  /** 根据 ID 获取单个应用 */
  get(appId: string): Application | undefined {
    return this.apps.get(appId);
  }

  /** 检查应用是否存在 */
  has(appId: string): boolean {
    return this.apps.has(appId);
  }
}

export const appRegistry = new AppRegistry();
