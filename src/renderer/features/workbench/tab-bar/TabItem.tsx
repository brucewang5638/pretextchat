// ============================================================
// TabItem — 单个实例标签项
// ============================================================
// 支持三件高频操作：
// 1. 切换实例
// 2. 双击重命名
// 3. 悬停关闭

import type { KeyboardEvent, MouseEvent } from "react";
import { useUIStore } from "../../../store";
import { AppIcon } from "../../../shared/ui/AppIcon/AppIcon";
import { IconButton } from "../../../shared/ui/IconButton";
import { CloseIcon } from "../../../shared/ui/icons";
import type { TabDescriptor } from "./tab-bar.types";

export function TabItem({
  id,
  label,
  icon,
  appName,
  isActive,
  isLoading,
}: TabDescriptor) {
  const hoveredTabId = useUIStore((s) => s.hoveredTabId);
  const setHoveredTab = useUIStore((s) => s.setHoveredTab);
  const renamingTabId = useUIStore((s) => s.renamingTabId);
  const renameDraft = useUIStore((s) => s.renameDraft);
  const startRenaming = useUIStore((s) => s.startRenaming);
  const updateRenameDraft = useUIStore((s) => s.updateRenameDraft);
  const stopRenaming = useUIStore((s) => s.stopRenaming);

  const isHovered = hoveredTabId === id;
  const isRenaming = renamingTabId === id;

  const handleClick = () => {
    if (!isActive) {
      window.api.switchInstance(id);
    }
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    window.api.closeInstance(id);
  };

  const handleDoubleClick = () => {
    startRenaming(id, label);
  };

  const handleRenameSubmit = () => {
    // 真正的标题更新由主进程完成；
    // renderer 只负责在用户确认后发起请求。
    if (renameDraft.trim()) {
      window.api.renameInstance(id, renameDraft.trim());
    }
    stopRenaming();
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleRenameSubmit();
    if (event.key === "Escape") stopRenaming();
  };

  return (
    <div
      className={[
        'group relative flex h-10 min-w-0 max-w-[220px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm text-[var(--color-text-secondary)] shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-200 [-webkit-app-region:no-drag]',
        isActive
          ? 'border-[color:rgba(59,130,246,0.22)] bg-white text-[var(--color-text-primary)] shadow-[0_14px_34px_rgba(59,130,246,0.14)]'
          : 'border-transparent bg-[rgba(255,255,255,0.68)] hover:-translate-y-px hover:border-[color:rgba(148,163,184,0.24)] hover:bg-white hover:text-[var(--color-text-primary)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]',
      ].join(' ')}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredTab(id)}
      onMouseLeave={() => setHoveredTab(null)}
    >
      <AppIcon name={appName} icon={icon} size="sm" />

      {isRenaming ? (
        <input
          className="w-[120px] rounded-full border border-[var(--color-accent)] bg-[rgba(255,255,255,0.9)] px-2.5 py-1 text-sm text-[var(--color-text-primary)] outline-none"
          value={renameDraft}
          onChange={(e) => updateRenameDraft(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameKeyDown}
          autoFocus
        />
      ) : (
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      )}

      {isLoading && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[var(--color-accent)] shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />}

      {(isHovered || isActive) && (
        <IconButton
          className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-text-tertiary)] transition-colors duration-150 hover:bg-[var(--color-danger)] hover:text-white"
          onClick={handleClose}
          title="关闭"
        >
          <CloseIcon size={14} />
        </IconButton>
      )}
    </div>
  );
}
