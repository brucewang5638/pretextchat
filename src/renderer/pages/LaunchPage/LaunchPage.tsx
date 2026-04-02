import { AppIcon } from '../../components/AppIcon/AppIcon';
import { useUIStore } from '../../store';
import { AppCard } from '../../components/AppCard/AppCard';
import styles from './LaunchPage.module.css';

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);

  if (!snapshot) {
    return <div className={styles.page}>加载中...</div>;
  }

  const { apps, preferences, workspace } = snapshot;
  const hasSnapshot = workspace.instances.length > 0;
  const startupMode = preferences.startupMode;

  const handleRestore = async () => {
    await window.api.restoreSession();
    setCurrentPage('workbench');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>PretextChat</h1>
        <p className={styles.tagline}>AI 多实例工作台</p>
      </header>

      {hasSnapshot && (
        <section className={styles.restoreSection}>
          <button className={styles.restoreBtn} onClick={handleRestore}>
            恢复上次会话（{workspace.instances.length} 个实例）
          </button>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>启动方式</h2>
        <div className={styles.startupModes}>
          <button
            className={`${styles.modeBtn} ${startupMode === 'home' ? styles.modeBtnActive : ''}`}
            onClick={() => window.api.setStartupMode('home')}
          >
            进入首页
          </button>
          <button
            className={`${styles.modeBtn} ${startupMode === 'restoreLastSession' ? styles.modeBtnActive : ''}`}
            onClick={() => window.api.setStartupMode('restoreLastSession')}
          >
            自动恢复上次会话
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AI 应用</h2>
        <div className={styles.appGrid}>
          {apps.map((app) => (
            <AppCard key={app.id} id={app.id} name={app.name} icon={app.icon} />
          ))}
        </div>
      </section>

      {preferences.recentApps.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>最近使用</h2>
          <div className={styles.recentList}>
            {preferences.recentApps.slice(0, 5).map((appId) => {
              const app = apps.find((a) => a.id === appId);
              if (!app) return null;
              return (
                <button
                  key={appId}
                  className={styles.recentItem}
                  onClick={async () => {
                    await window.api.createInstance(appId);
                    setCurrentPage('workbench');
                  }}
                >
                  <span className={styles.recentIcon}>{app.name.charAt(0)}</span>
                  <span>{app.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {preferences.recentInstances.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>最近任务</h2>
          <div className={styles.recentInstances}>
            {preferences.recentInstances.slice(0, 6).map((entry) => {
              const app = apps.find((item) => item.id === entry.applicationId);
              if (!app) return null;
              const isOpen = workspace.instances.some((instance) => instance.id === entry.instanceId);

              return (
                <button
                  key={entry.instanceId}
                  className={styles.recentInstance}
                  onClick={async () => {
                    await window.api.reopenRecentInstance(entry.instanceId);
                    setCurrentPage('workbench');
                  }}
                >
                  <AppIcon name={app.name} icon={app.icon} size="md" />
                  <span className={styles.recentInstanceMeta}>
                    <span className={styles.recentInstanceTitle}>{entry.title}</span>
                    <span className={styles.recentInstanceSubtitle}>
                      {app.name} · {isOpen ? '已打开' : '重新打开'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
