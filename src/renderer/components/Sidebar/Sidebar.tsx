import { useUIStore } from '../../store';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  const apps = snapshot?.apps || [];
  
  const handleGoHome = () => {
    setActiveAppFilter(null);
    setCurrentPage('launch');
  };

  const handleSelectApp = (appId: string) => {
    setActiveAppFilter(appId);
    setCurrentPage('workbench');
  };

  return (
    <aside className={styles.sidebar}>
      <button 
        className={`${styles.homeAction} ${currentPage === 'launch' ? styles.homeActionActive : ''}`}
        onClick={handleGoHome}
        title="应用主页"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      <div className={styles.divider}></div>

      {apps.map(app => {
        const isActive = currentPage === 'workbench' && activeAppFilter === app.id;
        return (
          <div 
            key={app.id} 
            className={`${styles.appIconContainer} ${isActive ? styles.appIconActive : ''}`}
            onClick={() => handleSelectApp(app.id)}
            title={app.name}
          >
            <div className={styles.activeIndicator}></div>
            <div className={styles.appIcon}>
              {app.image ? (
                <img src={app.image} alt={app.name} />
              ) : (
                app.name.charAt(0)
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
