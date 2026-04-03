// ============================================================
// EventLogger — 用户行为事件日志
// ============================================================
// Phase 1 核心验证模块。写本地 JSON Lines 文件。
// Phase 2+ 可接入远程上报。

import { app } from 'electron';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { EventType } from '../shared/constants';

interface LogEntry {
  event: EventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

class EventLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFile = path.join(this.logDir, 'events.jsonl');
  }

  /** 记录事件 */
  log(event: EventType, data?: Record<string, unknown>): void {
    // JSON Lines 的好处是“单条追加、单条解析”都很简单，
    // 非常适合这种轻量本地埋点，不需要维护完整 JSON 数组。
    const entry: LogEntry = {
      event,
      timestamp: Date.now(),
      ...(data ? { data } : {}),
    };

    try {
      if (!existsSync(this.logDir)) {
        mkdirSync(this.logDir, { recursive: true });
      }
      appendFileSync(this.logFile, JSON.stringify(entry) + '\n', 'utf-8');
    } catch (err) {
      console.error('[EventLogger] Failed to write log:', err);
    }
  }

  /** 获取日志文件路径 */
  getLogPath(): string {
    return this.logFile;
  }

  /** 导出所有日志 */
  exportLogs(): LogEntry[] {
    try {
      if (!existsSync(this.logFile)) return [];
      const { readFileSync } = require('node:fs');
      const content = readFileSync(this.logFile, 'utf-8');
      return content
        .split('\n')
        .filter(Boolean)
        .map((line: string) => JSON.parse(line) as LogEntry);
    } catch (err) {
      console.error('[EventLogger] Failed to export logs:', err);
      return [];
    }
  }
}

export const eventLogger = new EventLogger();
