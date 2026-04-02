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

  const handleNewTab = () => {
    // 切换回启动页：关闭所有实例的激活状态
    // 实际上这需要通知 main 清除 activeInstanceId
    // Phase 1 简化：点击 + 号暂不处理，用户回到启动页通过关闭所有标签
  };

  return (
    <div className={styles.tabBar}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <TabItem key={tab.id} {...tab} />
        ))}
      </div>
      <button className={styles.newTabBtn} onClick={handleNewTab} title="新建标签">
        +
      </button>
    </div>
  );
}
