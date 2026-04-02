import { useUIStore } from '../../store';
import styles from './TabBar.module.css';

interface TabItemProps {
  id: string;
  label: string;
  icon: string;
  appName: string;
  isActive: boolean;
  isLoading: boolean;
}

export function TabItem({ id, label, appName, isActive, isLoading }: TabItemProps) {
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
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredTab(id)}
      onMouseLeave={() => setHoveredTab(null)}
    >
      <span className={styles.tabIcon}>{appName.charAt(0)}</span>

      {isRenaming ? (
        <input
          className={styles.renameInput}
          value={renameDraft}
          onChange={(e) => updateRenameDraft(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameKeyDown}
          autoFocus
        />
      ) : (
        <span className={styles.tabLabel}>{label}</span>
      )}

      {isLoading && <span className={styles.loadingDot} />}

      {(isHovered || isActive) && (
        <button className={styles.closeBtn} onClick={handleClose} title="关闭">
          ×
        </button>
      )}
    </div>
  );
}
