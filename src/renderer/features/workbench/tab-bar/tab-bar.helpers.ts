import type { StateSnapshot } from "../../../../shared/types";
import type { TabDescriptor } from "./tab-bar.types";

interface TabBarModel {
  activeAppName: string;
  tabs: TabDescriptor[];
}

export function buildTabBarModel(
  snapshot: StateSnapshot,
  activeAppFilter: string,
): TabBarModel {
  const activeApp = snapshot.apps.find((app) => app.id === activeAppFilter);
  const instancesById = new Map(
    snapshot.workspace.instances.map((instance) => [instance.id, instance]),
  );

  const tabs: TabDescriptor[] = [];
  for (const id of snapshot.workspace.tabOrder) {
    const instance = instancesById.get(id);
    if (!instance || instance.applicationId !== activeAppFilter) continue;

    tabs.push({
      id,
      label: instance.title || "Loading...",
      icon: activeApp?.icon || "",
      appName: activeApp?.name || "",
      isActive: id === snapshot.workspace.activeInstanceId,
      isLoading: snapshot.runtimeStates[id]?.status === "loading",
    });
  }

  return {
    activeAppName: activeApp?.name || "",
    tabs,
  };
}
