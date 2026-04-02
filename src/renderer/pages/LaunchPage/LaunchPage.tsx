import { useUIStore } from '../../store';
import { AppCard } from '../../components/AppCard/AppCard';
import styles from './LaunchPage.module.css';

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);

  if (!snapshot) {
    return <div className={styles.page}>加载中...</div>;
  }

  const { apps, preferences, workspace } = snapshot;
  const hasSnapshot = workspace.instances.length > 0;

  const handleRestore = async () => {
    await window.api.restoreSession();
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
                  onClick={() => window.api.createInstance(appId)}
                >
                  <span className={styles.recentIcon}>{app.name.charAt(0)}</span>
                  <span>{app.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
