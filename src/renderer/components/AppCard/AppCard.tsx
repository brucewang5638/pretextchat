import { useUIStore } from '../../store';
import { AppIcon } from '../AppIcon/AppIcon';
import styles from './AppCard.module.css';

interface AppCardProps {
  id: string;
  name: string;
  icon: string;
  image?: string;
  category?: string;
  description?: string;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
}

export function AppCard({ id, name, icon, image, category, description, isPinned, onTogglePin }: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);
  
  const handleClick = async () => {
    await window.api.createInstance(id);
    setActiveAppFilter(id);
    setCurrentPage('workbench');
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePin) onTogglePin(id);
  };

  return (
    <button
      className={styles.card}
      onClick={handleClick}
      title={`打开 ${name}`}
      aria-label={`新建 ${name} 实例`}
      type="button"
    >
      <div className={styles.pinBtn} onClick={handlePinClick} title={isPinned ? "取消固定" : "固定到侧边栏"}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isPinned ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isPinned ? styles.pinnedIcon : styles.unpinnedIcon}
        >
          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 1 0 2.828 2.828l13.348-13.348Z"/>
          <path d="m3.9 3.9 9.9 9.9"/>
          <path d="m15 5 4 4"/>
          <path d="m10.5 9.5-6.5 2"/>
          <path d="m14.5 13.5 2-6.5"/>
          <path d="m2 22 5-5"/>
        </svg>
      </div>
      
      <div className={styles.iconWrapper}>
        {image ? (
          <img src={image} alt={name} className={styles.imageIcon} />
        ) : (
          <AppIcon name={name} icon={icon} size="lg" />
        )}
      </div>
      <div className={styles.copy}>
        <span className={styles.name}>{name}</span>
        <span className={styles.description}>{description || '强大的 AI 助手'}</span>
      </div>
    </button>
  );
}
