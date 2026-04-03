// ============================================================
// TabBar — 当前应用下的实例标签栏
// ============================================================
// 这里不展示所有实例，只展示“当前 activeAppFilter 对应应用”的实例。

import { useUIStore } from "../../../store";
import { NewTabButton } from "./NewTabButton";
import { TabItem } from "./TabItem";
import { buildTabBarModel } from "./tab-bar.helpers";

export function TabBar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  if (!snapshot || !activeAppFilter) return null;

  const { activeAppName, tabs } = buildTabBarModel(snapshot, activeAppFilter);

  return (
    <div className="flex h-14 items-center border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))] px-3 shadow-[inset_0_-1px_0_rgba(148,163,184,0.14)] [-webkit-app-region:drag]">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto py-2 [-webkit-app-region:no-drag] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <TabItem key={tab.id} {...tab} />
        ))}
        <NewTabButton appId={activeAppFilter} appName={activeAppName} />
      </div>
    </div>
  );
}
