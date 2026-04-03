import type {
  Application,
  PersistedInstance,
  StateSnapshot,
} from "../../../../shared/types";

interface SidebarModel {
  apps: Application[];
  instancesByAppId: Map<string, PersistedInstance[]>;
}

export function buildSidebarModel(
  snapshot: StateSnapshot | null,
): SidebarModel {
  const instancesByAppId = new Map<string, PersistedInstance[]>();

  if (!snapshot) {
    return {
      apps: [],
      instancesByAppId,
    };
  }

  for (const instance of snapshot.workspace.instances) {
    const existing = instancesByAppId.get(instance.applicationId);
    if (existing) {
      existing.push(instance);
      continue;
    }
    instancesByAppId.set(instance.applicationId, [instance]);
  }

  const visibleAppIds = new Set([
    ...instancesByAppId.keys(),
    ...(snapshot.preferences.pinnedAppIds ?? []),
  ]);
  const customOrderIndex = new Map(
    (snapshot.preferences.customSidebarOrder ?? []).map((id, index) => [
      id,
      index,
    ]),
  );

  const apps = snapshot.apps
    .filter((app) => visibleAppIds.has(app.id))
    .sort((a, b) => {
      const aIndex = customOrderIndex.get(a.id);
      const bIndex = customOrderIndex.get(b.id);

      if (aIndex != null && bIndex != null) return aIndex - bIndex;
      if (aIndex != null) return -1;
      if (bIndex != null) return 1;
      return 0;
    });

  return {
    apps,
    instancesByAppId,
  };
}
