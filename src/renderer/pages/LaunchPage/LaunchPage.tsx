import { useUIStore } from '../../store';
import { AppCard } from '../../components/AppCard/AppCard';
import styles from './LaunchPage.module.css';

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);

  if (!snapshot) {
    return <div className={styles.layout}>加载中...</div>;
  }

  const { apps, workspace } = snapshot;
  const hasSnapshot = workspace?.instances?.length > 0;

  // Derive categories from applications dynamically
  const groupsInfo = apps.reduce(
    (acc, app) => {
      const cat = app.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = 0;
      acc[cat]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categories = Object.entries(groupsInfo);

  const handleRestore = async () => {
    await window.api.restoreSession();
    setCurrentPage('workbench');
  };

  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        {/* Top Search Bar */}
        <div className={styles.topBar}>
          <input
            type="text"
            placeholder="搜索 AI 应用..."
            className={styles.searchInput}
          />
          <button className={styles.connectBtn}>连接</button>
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <button className={styles.actionBtn}>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            启动新应用
          </button>
          
          {hasSnapshot && (
            <button
              className={`${styles.actionBtn} ${styles.actionBtnDark}`}
              onClick={handleRestore}
            >
              恢复 {workspace.instances.length} 个实例
            </button>
          )}
        </div>

        {/* Groups Area */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>应用分组</h2>
          <div className={styles.horizontalScroll}>
            {categories.map(([catName, count]) => (
              <div key={catName} className={styles.groupCard}>
                <div className={styles.groupCardIcon}>
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                  </svg>
                </div>
                <div className={styles.groupCardCopy}>
                  <span className={styles.groupCardTitle}>{catName}</span>
                  <span className={styles.groupCardSubtitle}>{count} 个应用</span>
                </div>
              </div>
            ))}
            
            {/* Hardcoded example groups from Termius screenshot layout */}
            <div className={styles.groupCard}>
              <div className={styles.groupCardIcon}>
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </div>
              <div className={styles.groupCardCopy}>
                <span className={styles.groupCardTitle}>收藏夹</span>
                <span className={styles.groupCardSubtitle}>0 个应用</span>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>所有应用</h2>
          <div className={styles.appGrid}>
            {apps.map((app) => (
              <AppCard
                key={app.id}
                id={app.id}
                name={app.name}
                icon={app.icon}
                category={app.category}
                description={app.description}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
