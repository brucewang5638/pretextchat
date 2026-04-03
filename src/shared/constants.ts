// ============================================================
// PretextChat — IPC 通道名 + 事件类型常量
// ============================================================
// 这份文件的目标只有一个：让跨进程通道名集中定义，避免字符串散落各处。

/** IPC 通道定义，main 和 renderer 共用 */
export const IPC = {
  // Renderer → Main（invoke，请求式）
  GET_APP_LIST:    'app:list',
  CREATE_INSTANCE: 'instance:create',
  CLOSE_INSTANCE:  'instance:close',
  SWITCH_INSTANCE: 'instance:switch',
  RENAME_INSTANCE: 'instance:rename',
  REOPEN_RECENT_INSTANCE: 'instance:reopenRecent',
  RESTORE_SESSION: 'session:restore',
  GET_RECENT:      'recent:get',
  GET_INITIAL_STATE: 'state:initial',
  SET_STARTUP_MODE: 'preferences:setStartupMode',
  TOGGLE_PIN_APP:  'preferences:togglePinApp',
  OPEN_EXTERNAL:   'system:openExternal',

  // Main → Renderer（send，推送式）
  STATE_SYNC:      'state:sync',
} as const;

/** 用户行为事件类型（EventLogger 使用） */
export type EventType =
  | 'app_launched'
  | 'instance_created'
  | 'instance_switched'
  | 'instance_closed'
  | 'instance_renamed'
  | 'restore_offered'
  | 'restore_clicked'
  | 'restore_success'
  | 'restore_failed'
  | 'launch_page_app_clicked'
  | 'navigation_blocked'
  | 'load_failed'
  | 'login_detected'
  | 'session_duration';
