// ============================================================
// PretextChat — IPC 通道名 + 事件类型常量
// ============================================================

/** IPC 通道定义，main 和 renderer 共用 */
export const IPC = {
  // Renderer → Main（invoke，请求式）
  GET_APP_LIST:    'app:list',
  CREATE_INSTANCE: 'instance:create',
  CLOSE_INSTANCE:  'instance:close',
  SWITCH_INSTANCE: 'instance:switch',
  RENAME_INSTANCE: 'instance:rename',
  RESTORE_SESSION: 'session:restore',
  GET_RECENT:      'recent:get',

  // Main → Renderer（send，推送式）
  STATE_SYNC:      'state:sync',
  INSTANCE_STATUS: 'instance:status',
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
