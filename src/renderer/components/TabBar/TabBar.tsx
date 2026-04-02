import { useUIStore } from '../../store';
import { TabItem } from './TabItem';
import styles from './TabBar.module.css';

export function TabBar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  if (!snapshot || !activeAppFilter) return null;

  const { workspace, runtimeStates, apps } = snapshot;
  const activeApp = apps.find(a => a.id === activeAppFilter);

  // Filter tabs to only show instances of the active App
  const appInstanceIds = workspace.tabOrder.filter(id => {
    const inst = workspace.instances.find(i => i.id === id);
    return inst?.applicationId === activeAppFilter;
  });

  const tabs = appInstanceIds.map((id) => {
    const inst = workspace.instances.find((i) => i.id === id);
    const runtime = runtimeStates[id];
    return {
      id,
      label: inst?.title || 'Loading...',
      icon: activeApp?.icon || '',
      appName: activeApp?.name || '',
      isActive: id === workspace.activeInstanceId,
      isLoading: runtime?.status === 'loading',
    };
  });

  return (
    <div className={styles.tabBar}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <TabItem key={tab.id} {...tab} />
        ))}
        
        <button
          className={styles.newTabBtn}
          onClick={() => window.api.createInstance(activeAppFilter)}
          title={`新建 ${activeApp?.name} 实例`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建 {activeApp?.name} 标签页
        </button>
      </div>
    </div>
  );
}
