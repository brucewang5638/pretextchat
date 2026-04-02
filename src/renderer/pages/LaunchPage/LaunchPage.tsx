import { useState, useMemo } from 'react';
import { useUIStore } from '../../store';
import { AppCard } from '../../components/AppCard/AppCard';
import styles from './LaunchPage.module.css';

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);
  const [searchQuery, setSearchQuery] = useState('');

  if (!snapshot) {
    return <div className={styles.layout}>加载中...</div>;
  }

  const { apps, workspace } = snapshot;
  const hasSnapshot = workspace?.instances?.length > 0;

  // Filter apps by search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const lowerQuery = searchQuery.toLowerCase();
    return apps.filter(
      (app) => 
        app.name.toLowerCase().includes(lowerQuery) || 
        (app.description && app.description.toLowerCase().includes(lowerQuery)) ||
        (app.category && app.category.toLowerCase().includes(lowerQuery))
    );
  }, [apps, searchQuery]);

  // Derive categories from filtered applications dynamically
  const groupsInfo = useMemo(() => {
    return filteredApps.reduce(
      (acc, app) => {
        const cat = app.category || '未分类';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat]++;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredApps]);

  const handleRestore = async () => {
    const restored = await window.api.restoreSession();
    if (restored && restored.activeInstanceId) {
      const activeInst = restored.instances.find(i => i.id === restored.activeInstanceId);
      if (activeInst) {
        setActiveAppFilter(activeInst.applicationId);
      }
    } else if (restored && restored.instances.length > 0) {
      setActiveAppFilter(restored.instances[0].applicationId);
    }
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>



        {/* Applications Clustered by Category */}
        <div className={styles.categoryContainer}>
          {Object.keys(groupsInfo).length === 0 ? (
            <div style={{ padding: '40px 0', color: 'var(--color-text-muted)' }}>
              没有找到与 "{searchQuery}" 相关的应用
            </div>
          ) : (
            Object.entries(groupsInfo).map(([category, count]) => {
              const categoryApps = filteredApps.filter(a => (a.category || '未分类') === category);
              
              return (
                <section key={category} className={styles.section} style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{category}</h2>
                    <span className={styles.groupCardSubtitle} style={{ fontSize: '13px' }}>
                      {count} 个应用
                    </span>
                  </div>
                  
                  <div className={styles.appGrid}>
                    {categoryApps.map((app) => (
                      <AppCard
                        key={app.id}
                        id={app.id}
                        name={app.name}
                        icon={app.icon}
                        image={app.image}
                        category={app.category}
                        description={app.description}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
