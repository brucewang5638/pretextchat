import { useUIStore } from '../../store';
import { resolveAssetPath } from '../../lib/assets';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  // Filter apps to strictly those that have running instances
  const activeAppIds = new Set(snapshot?.workspace.instances.map(inst => inst.applicationId) || []);
  const pinnedAppIds = new Set(snapshot?.preferences.pinnedAppIds || []);
  const displayAppIds = new Set([...activeAppIds, ...pinnedAppIds]);
  const apps = (snapshot?.apps || []).filter(app => displayAppIds.has(app.id));
  
  const handleGoHome = async () => {
    await window.api.switchInstance(null);
    setActiveAppFilter(null);
    setCurrentPage('launch');
  };

  const handleSelectApp = async (appId: string) => {
    setActiveAppFilter(appId);
    
    const instancesForApp = snapshot?.workspace.instances.filter(i => i.applicationId === appId) || [];
    if (instancesForApp.length > 0) {
      // Jump to the first instance of this app
      await window.api.switchInstance(instancesForApp[0].id);
    } else {
      // Auto-create if none exists
      await window.api.createInstance(appId);
    }
    
    setCurrentPage('workbench');
  };

  return (
    <aside className={styles.sidebar}>
      <button 
        className={`${styles.homeAction} ${currentPage === 'launch' ? styles.homeActionActive : ''}`}
        onClick={handleGoHome}
        title="应用主页"
      >
        <img
          src={resolveAssetPath('/branding/pretextchat-logo.svg')}
          alt="PretextChat"
          className={styles.homeLogo}
        />
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
                <img src={resolveAssetPath(app.image)} alt={app.name} />
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
