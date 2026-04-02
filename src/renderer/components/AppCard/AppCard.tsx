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
}

export function AppCard({ id, name, icon, image, category, description }: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);
  
  const handleClick = async () => {
    await window.api.createInstance(id);
    setActiveAppFilter(id);
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
