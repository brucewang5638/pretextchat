import { useUIStore } from '../../store';
import { AppIcon } from '../AppIcon/AppIcon';
import styles from './AppCard.module.css';

interface AppCardProps {
  id: string;
  name: string;
  icon: string;
}

export function AppCard({ id, name, icon }: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);

  const handleClick = async () => {
    await window.api.createInstance(id);
    setCurrentPage('workbench');
  };

  return (
    <button className={styles.card} onClick={handleClick} title={`打开 ${name}`}>
      <div className={styles.iconWrapper}>
        <AppIcon name={name} icon={icon} size="lg" />
      </div>
      <span className={styles.name}>{name}</span>
    </button>
  );
}
