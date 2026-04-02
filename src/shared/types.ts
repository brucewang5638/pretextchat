// ============================================================
// PretextChat — 跨进程共享类型契约
// ============================================================
// 只放 main 和 renderer 之间真正需要共享的类型。
// 不放：组件 Props、Zustand store 类型、main 私有实现类型。

/** Electron 的 Rectangle 类型简化 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── AI 应用定义（对应 data/ai-apps.json）──────────────────

export interface NavigationConfig {
  /** 站内导航白名单（hostname-only，支持 *.example.com） */
  allowedHosts: string[];
  /** 三方登录弹窗域名（hostname-only） */
  allowedPopupHosts: string[];
  /** 系统浏览器打开的域名（hostname-only） */
  externalHostnames: string[];
  /** 系统浏览器打开的 URL 前缀 */
  externalUrlPrefixes: string[];
}

export interface Application {
  id: string;
  name: string;
  icon: string;
  image?: string;
  startUrl: string;
  category?: string;
  description?: string;
  navigation: NavigationConfig;
  // partition 由 app.id 派生：`persist:${app.id}`
  // 不在配置中额外存 partitionKey
}

// ─── 持久化实例（落盘可恢复的字段子集）─────────────────────

export interface PersistedInstance {
  id: string;
  applicationId: string;
  title: string;
  titleSource: 'user' | 'page';
  createdAt: number;
  lastOpenedAt: number;
}

// ─── 持久化工作区状态 ────────────────────────────────────

export interface PersistedWorkspaceState {
  instances: PersistedInstance[];
  tabOrder: string[];
  activeInstanceId: string | null;
}

// ─── 持久化偏好 ──────────────────────────────────────────

export interface Preferences {
  recentApps: string[];
  recentInstances: RecentInstanceEntry[];
  startupMode: 'home' | 'restoreLastSession';
  restoreOnStartup: boolean;
}

export interface RecentInstanceEntry {
  instanceId: string;
  applicationId: string;
  title: string;
  lastOpenedAt: number;
}

// ─── 运行时实例状态（main 内存，不落盘）──────────────────

export interface RuntimeInstanceState {
  id: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  webContentsId: number | null;
  isVisible: boolean;
  lastLoadError: string | null;
  viewBounds: Rectangle | null;
  titleSource: 'user' | 'page';
}

// ─── IPC 推送给 renderer 的完整状态快照 ──────────────────

export interface StateSnapshot {
  workspace: PersistedWorkspaceState;
  runtimeStates: Record<string, RuntimeInstanceState>;
  apps: Application[];
  preferences: Preferences;
}
