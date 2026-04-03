// ============================================================
// TabBar — 当前应用下的实例标签栏
// ============================================================
// 这里不展示所有实例，只展示“当前 activeAppFilter 对应应用”的实例。

import { useUIStore } from '../../store';
import { TabItem } from './TabItem';

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
    <div className="flex h-10 items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 [-webkit-app-region:drag]">
      <div className="flex flex-1 items-center gap-0.5 overflow-x-auto [-webkit-app-region:no-drag] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <TabItem key={tab.id} {...tab} />
        ))}
        
        <button
          className="ml-2 flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] bg-transparent px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-all duration-150 hover:border-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] [-webkit-app-region:no-drag]"
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
