import { AppIcon } from '../AppIcon/AppIcon';
import { useUIStore } from '../../store';

interface TabItemProps {
  id: string;
  label: string;
  icon: string;
  appName: string;
  isActive: boolean;
  isLoading: boolean;
}

export function TabItem({ id, label, icon, appName, isActive, isLoading }: TabItemProps) {
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

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.api.closeInstance(id);
  };

  const handleDoubleClick = () => {
    startRenaming(id, label);
  };

  const handleRenameSubmit = () => {
    if (renameDraft.trim()) {
      window.api.renameInstance(id, renameDraft.trim());
    }
    stopRenaming();
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') stopRenaming();
  };

  return (
    <div
      className={[
        'relative flex min-w-0 max-w-[180px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] transition-colors duration-150 [-webkit-app-region:no-drag]',
        isActive ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]' : 'hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]',
      ].join(' ')}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredTab(id)}
      onMouseLeave={() => setHoveredTab(null)}
    >
      <AppIcon name={appName} icon={icon} size="sm" />

      {isRenaming ? (
        <input
          className="w-[100px] rounded-[3px] border border-[var(--color-accent)] bg-transparent px-1 py-px text-xs text-[var(--color-text-primary)] outline-none"
          value={renameDraft}
          onChange={(e) => updateRenameDraft(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameKeyDown}
          autoFocus
        />
      ) : (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}

      {isLoading && <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--color-accent)]" />}

      {(isHovered || isActive) && (
        <button
          className="shrink-0 rounded-[3px] px-0.5 text-sm leading-none text-[var(--color-text-secondary)] hover:bg-[var(--color-danger)] hover:text-white"
          onClick={handleClose}
          title="关闭"
        >
          ×
        </button>
      )}
    </div>
  );
}
