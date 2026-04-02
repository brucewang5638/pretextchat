import { useUIStore } from '../../store';
import { TabItem } from './TabItem';
import styles from './TabBar.module.css';

export function TabBar() {
  const snapshot = useUIStore((s) => s.snapshot);
  if (!snapshot) return null;

  const { workspace, runtimeStates, apps } = snapshot;

  const tabs = workspace.tabOrder.map((id) => {
    const inst = workspace.instances.find((i) => i.id === id);
    const runtime = runtimeStates[id];
    const app = apps.find((a) => a.id === inst?.applicationId);
    return {
      id,
      label: inst?.title || 'Loading...',
      icon: app?.icon || '',
      appName: app?.name || '',
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
      </div>
      <div className={styles.appMenu}>
        {apps.map((app) => (
          <button
            key={app.id}
            className={styles.appMenuItem}
            onClick={() => window.api.createInstance(app.id)}
            title={`新建 ${app.name} 实例`}
          >
            {app.name}
          </button>
        ))}
      </div>
    </div>
  );
}
