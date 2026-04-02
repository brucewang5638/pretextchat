// ============================================================
// Zustand Store — 仅 UI 派生状态
// ============================================================
// 不做持久化，不做业务真相。
// 业务状态从 main 通过 IPC STATE_SYNC 推送过来。

import { create } from 'zustand';
import type { StateSnapshot } from '../shared/types';

interface UIState {
  // ─── 从 main 同步的状态（只读镜像）──────────────────
  snapshot: StateSnapshot | null;

  // ─── 纯 UI 状态 ────────────────────────────────────
  hoveredTabId: string | null;
  renamingTabId: string | null;
  renameDraft: string;
  isRestoreDialogOpen: boolean;

  // ─── Actions ───────────────────────────────────────
  setSnapshot: (snapshot: StateSnapshot) => void;
  setHoveredTab: (id: string | null) => void;
  startRenaming: (id: string, currentTitle: string) => void;
  updateRenameDraft: (draft: string) => void;
  stopRenaming: () => void;
  setRestoreDialogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  snapshot: null,
  hoveredTabId: null,
  renamingTabId: null,
  renameDraft: '',
  isRestoreDialogOpen: false,

  setSnapshot: (snapshot) => set({ snapshot }),
  setHoveredTab: (id) => set({ hoveredTabId: id }),
  startRenaming: (id, currentTitle) => set({ renamingTabId: id, renameDraft: currentTitle }),
  updateRenameDraft: (draft) => set({ renameDraft: draft }),
  stopRenaming: () => set({ renamingTabId: null, renameDraft: '' }),
  setRestoreDialogOpen: (open) => set({ isRestoreDialogOpen: open }),
}));
