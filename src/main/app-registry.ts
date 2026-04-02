// ============================================================
// AppRegistry — 预置 AI 应用目录
// ============================================================
// 读取 data/ai-apps.json，提供应用列表查询。
// Phase 1：只读，不支持用户修改。

import { Application } from '../shared/types';
import aiAppsData from '../../data/ai-apps.json';

class AppRegistry {
  private apps: Map<string, Application>;

  constructor() {
    const apps = aiAppsData as Application[];
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
