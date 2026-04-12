// ============================================================
// InstanceStore — 实例状态管理（唯一真相源）
// ============================================================
// 管理实例全生命周期。状态变更后自动持久化 + 推送 renderer。
// 持久化态 (PersistedInstance) 和运行态 (RuntimeInstanceState) 分离。

import { randomUUID } from 'node:crypto';
import type {
  PersistedInstance,
  PersistedWorkspaceState,
  RecentInstanceEntry,
  RuntimeInstanceState,
} from '../../shared/types';
import { appRegistry } from '../catalog/app-registry';
import { localStore } from '../persistence/local-store';

class InstanceStore {
  private workspace: PersistedWorkspaceState;
  private runtimeStates: Map<string, RuntimeInstanceState> = new Map();
  private onChangeCallback: (() => void) | null = null;

  constructor() {
    this.workspace = localStore.getWorkspaceState();
    // 为已持久化的实例创建 idle 运行态
    for (const inst of this.workspace.instances) {
      this.runtimeStates.set(inst.id, this.createIdleRuntime(inst.id, inst.titleSource));
    }
  }

  /** 注册状态变更回调（用于 IPC 推送） */
  onChange(callback: () => void): void {
    this.onChangeCallback = callback;
  }

  // ─── 实例生命周期 ──────────────────────────────────────

  createInstance(
    appId: string,
    options?: { title?: string; titleSource?: 'user' | 'page' },
  ): PersistedInstance {
    const app = appRegistry.get(appId);
    if (!app) throw new Error(`Unknown appId: ${appId}`);

    // 计算默认名（如 "ChatGPT 1", "ChatGPT 2"）
    const count = this.workspace.instances.filter((i) => i.applicationId === appId).length;
    const fallbackTitle = count === 0 ? app.name : `${app.name} ${count + 1}`;
    const title = options?.title ?? fallbackTitle;
    const titleSource = options?.titleSource ?? 'page';

    const instance: PersistedInstance = {
      id: randomUUID(),
      applicationId: appId,
      title,
      titleSource,
      lastUrl: app.startUrl,
      createdAt: Date.now(),
      lastOpenedAt: Date.now(),
    };

    this.workspace.instances.push(instance);
    this.workspace.tabOrder.push(instance.id);
    this.workspace.activeInstanceId = instance.id;

    // 这里只创建“运行态记录”，不直接创建真实网页视图。
    // 真正的视图创建由 ipc-handlers -> view-manager 在需要显示时触发。
    this.runtimeStates.set(instance.id, {
      id: instance.id,
      status: 'loading',
      hostingState: 'released',
      webContentsId: null,
      isVisible: true,
      lastLoadError: null,
      viewBounds: null,
      titleSource,
    });

    this.persist();
    localStore.updateRecentApps(appId);
    this.touchRecentInstance(instance);
    this.notifyChange();
    return instance;
  }

  closeInstance(id: string): void {
    const inst = this.workspace.instances.find((i) => i.id === id);
    this.workspace.instances = this.workspace.instances.filter((i) => i.id !== id);
    this.workspace.tabOrder = this.workspace.tabOrder.filter((tabId) => tabId !== id);
    this.runtimeStates.delete(id);

    if (this.workspace.activeInstanceId === id) {
      this.workspace.activeInstanceId =
        this.workspace.tabOrder.length > 0
          ? this.workspace.tabOrder[this.workspace.tabOrder.length - 1]
          : null;
    }

    this.persist();
    if (inst) this.touchRecentInstance(inst);
    this.notifyChange();
  }

  switchTo(id: string | null): void {
    if (id !== null && !this.has(id)) throw new Error(`Instance not found: ${id}`);

    // 切换时先改主进程真相源，再由上层 view-manager 根据 activeInstanceId 调整真实视图。
    if (this.workspace.activeInstanceId) {
      const prev = this.runtimeStates.get(this.workspace.activeInstanceId);
      if (prev) prev.isVisible = false;
    }

    this.workspace.activeInstanceId = id;
    
    if (id !== null) {
      const runtime = this.runtimeStates.get(id);
      if (runtime) {
        runtime.isVisible = true;
      }

      // 更新 lastOpenedAt
      const inst = this.workspace.instances.find((i) => i.id === id);
      if (inst) {
        inst.lastOpenedAt = Date.now();
        this.touchRecentInstance(inst);
      }
    }

    this.persist();
    this.notifyChange();
  }

  rename(id: string, newTitle: string): void {
    const inst = this.workspace.instances.find((i) => i.id === id);
    if (!inst) throw new Error(`Instance not found: ${id}`);

    inst.title = newTitle;
    inst.titleSource = 'user'; // 用户重命名后锁定

    const runtime = this.runtimeStates.get(id);
    if (runtime) runtime.titleSource = 'user';

    this.persist();
    this.touchRecentInstance(inst);
    this.notifyChange();
  }

  /** 页面标题更新（仅在 titleSource === 'page' 时生效） */
  onPageTitleUpdated(id: string, pageTitle: string): void {
    const inst = this.workspace.instances.find((i) => i.id === id);
    if (!inst) return;

    const runtime = this.runtimeStates.get(id);
    if (inst.titleSource === 'page') {
      inst.title = pageTitle;
      this.persist();
      this.touchRecentInstance(inst);
      this.notifyChange();
    }
  }

  onPageUrlUpdated(id: string, url: string): void {
    const inst = this.workspace.instances.find((i) => i.id === id);
    if (!inst || inst.lastUrl === url) return;

    inst.lastUrl = url;
    this.persist();
  }

  // ─── 运行时状态更新 ────────────────────────────────────

  updateRuntimeStatus(id: string, status: RuntimeInstanceState['status'], error?: string): void {
    const runtime = this.runtimeStates.get(id);
    if (!runtime) return;
    runtime.status = status;
    runtime.lastLoadError = error || null;
    this.notifyChange();
  }

  setHostingState(id: string, hostingState: RuntimeInstanceState['hostingState']): void {
    const runtime = this.runtimeStates.get(id);
    if (!runtime) return;
    runtime.hostingState = hostingState;
    this.notifyChange();
  }

  setWebContentsId(id: string, webContentsId: number | null): void {
    const runtime = this.runtimeStates.get(id);
    if (runtime) runtime.webContentsId = webContentsId;
  }

  setViewBounds(id: string, bounds: RuntimeInstanceState['viewBounds']): void {
    const runtime = this.runtimeStates.get(id);
    if (!runtime) return;
    runtime.viewBounds = bounds;
    this.notifyChange();
  }

  markReleased(id: string): void {
    const runtime = this.runtimeStates.get(id);
    if (!runtime) return;
    // released 表示“实例 metadata 还在，但真实网页资源已经释放”，
    // 后续再次切回时会按懒创建逻辑重建。
    runtime.hostingState = 'released';
    runtime.status = 'idle';
    runtime.webContentsId = null;
    runtime.viewBounds = null;
    runtime.isVisible = false;
    this.notifyChange();
  }

  // ─── 查询 ──────────────────────────────────────────────

  has(id: string): boolean {
    return this.workspace.instances.some((i) => i.id === id);
  }

  getWorkspaceState(): PersistedWorkspaceState {
    return { ...this.workspace };
  }

  getRuntimeStates(): Record<string, RuntimeInstanceState> {
    return Object.fromEntries(this.runtimeStates);
  }

  getRuntimeState(id: string): RuntimeInstanceState | undefined {
    return this.runtimeStates.get(id);
  }

  getInstance(id: string): PersistedInstance | undefined {
    return this.workspace.instances.find((i) => i.id === id);
  }

  reopenRecentInstance(recentId: string): PersistedInstance {
    const openInstance = this.getInstance(recentId);
    if (openInstance) {
      this.switchTo(openInstance.id);
      return openInstance;
    }

    const recent = localStore.getPreferences().recentInstances.find((item) => item.instanceId === recentId);
    if (!recent) {
      throw new Error(`Recent instance not found: ${recentId}`);
    }

    return this.createInstance(recent.applicationId, {
      title: recent.title,
      titleSource: 'user',
    });
  }

  // ─── 会话恢复 ──────────────────────────────────────────

  saveSnapshot(): void {
    this.persist();
  }

  restoreSnapshot(): PersistedWorkspaceState | null {
    if (this.workspace.instances.length === 0) return null;

    this.ensureStartupActiveInstance();
    this.persist();
    return this.workspace;
  }

  // ─── 私有方法 ──────────────────────────────────────────

  private persist(): void {
    localStore.saveWorkspaceState(this.workspace);
  }

  private notifyChange(): void {
    this.onChangeCallback?.();
  }

  private createIdleRuntime(id: string, titleSource: 'user' | 'page'): RuntimeInstanceState {
    return {
      id,
      status: 'idle',
      hostingState: 'released',
      webContentsId: null,
      isVisible: false,
      lastLoadError: null,
      viewBounds: null,
      titleSource,
    };
  }

  private touchRecentInstance(instance: PersistedInstance): void {
    const entry: RecentInstanceEntry = {
      instanceId: instance.id,
      applicationId: instance.applicationId,
      title: instance.title,
      lastOpenedAt: instance.lastOpenedAt,
    };
    localStore.updateRecentInstance(entry);
  }

  private ensureStartupActiveInstance(): void {
    const currentActiveId = this.workspace.activeInstanceId;
    if (
      currentActiveId &&
      this.workspace.instances.some((instance) => instance.id === currentActiveId)
    ) {
      return;
    }

    const fallback = this.workspace.instances
      .slice()
      .sort((a, b) => {
        if (b.lastOpenedAt !== a.lastOpenedAt) {
          return b.lastOpenedAt - a.lastOpenedAt;
        }

        if (b.createdAt !== a.createdAt) {
          return b.createdAt - a.createdAt;
        }

        return 0;
      })[0];

    if (!fallback) return;

    this.workspace.activeInstanceId = fallback.id;
  }
}

export const instanceStore = new InstanceStore();
