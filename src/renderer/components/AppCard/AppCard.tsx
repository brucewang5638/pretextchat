import { useUIStore } from '../../store';
import styles from './AppCard.module.css';

interface AppCardProps {
  id: string;
  name: string;
  icon: string;
}

export function AppCard({ id, name, icon }: AppCardProps) {
  const handleClick = async () => {
    await window.api.createInstance(id);
  };

  return (
    <button className={styles.card} onClick={handleClick} title={`打开 ${name}`}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconPlaceholder}>
          {name.charAt(0)}
        </div>
      </div>
      <span className={styles.name}>{name}</span>
    </button>
  );
}
