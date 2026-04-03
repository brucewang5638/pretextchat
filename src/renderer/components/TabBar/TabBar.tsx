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
    <div className="flex h-14 items-center border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))] px-3 shadow-[inset_0_-1px_0_rgba(148,163,184,0.14)] [-webkit-app-region:drag]">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto py-2 [-webkit-app-region:no-drag] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <TabItem key={tab.id} {...tab} />
        ))}

        <button
          className="ml-1 inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-[color:rgba(148,163,184,0.28)] bg-white/92 px-4 text-sm font-semibold text-[var(--color-text-secondary)] shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-px hover:border-[color:rgba(59,130,246,0.3)] hover:bg-white hover:text-[var(--color-text-primary)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)] [-webkit-app-region:no-drag]"
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
