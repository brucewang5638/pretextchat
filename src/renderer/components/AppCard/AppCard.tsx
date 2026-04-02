import { useUIStore } from '../../store';
import { AppIcon } from '../AppIcon/AppIcon';
import styles from './AppCard.module.css';

interface AppCardProps {
  id: string;
  name: string;
  icon: string;
  category?: string;
  description?: string;
}

export function AppCard({ id, name, icon, category, description }: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  
  // Use category or description as the secondary text (Termius uses "ssh, root" format)
  const metaText = [category, description].filter(Boolean).join(' · ') || 'Web Application';

  const handleClick = async () => {
    await window.api.createInstance(id);
    setCurrentPage('workbench');
  };

  return (
    <button
      className={styles.card}
      onClick={handleClick}
      title={`打开 ${name}`}
      aria-label={`新建 ${name} 实例`}
      type="button"
    >
      <div className={styles.iconWrapper}>
        <AppIcon name={name} icon={icon} size="lg" />
      </div>
      <div className={styles.copy}>
        <span className={styles.name}>{name}</span>
        <span className={styles.description}>{metaText}</span>
      </div>
    </button>
  );
}
