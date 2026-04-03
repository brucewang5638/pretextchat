import type {
  Application,
  UpdateCheckResult,
} from "../../../shared/types";
import { CUSTOM_APP_LAUNCHER_ID } from "./launch.constants";
import type { LaunchAppGroup } from "./launch.types";

export function buildLaunchAppGroups(
  apps: Application[],
  searchQuery: string,
): LaunchAppGroup[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchedApps = normalizedQuery
    ? apps.filter(
        (app) =>
          app.name.toLowerCase().includes(normalizedQuery) ||
          app.description?.toLowerCase().includes(normalizedQuery) ||
          app.category?.toLowerCase().includes(normalizedQuery),
      )
    : apps;

  const sortedApps = [...matchedApps].sort((a, b) => {
    if (a.id === CUSTOM_APP_LAUNCHER_ID) return -1;
    if (b.id === CUSTOM_APP_LAUNCHER_ID) return 1;
    return a.name.localeCompare(b.name, "zh-CN");
  });

  const groupedApps = new Map<string, Application[]>();
  for (const app of sortedApps) {
    const category = app.category || "未分类";
    const existing = groupedApps.get(category);
    if (existing) {
      existing.push(app);
      continue;
    }
    groupedApps.set(category, [app]);
  }

  return Array.from(groupedApps.entries(), ([category, groupApps]) => ({
    category,
    apps: groupApps,
    count: groupApps.length,
  }));
}

export function getUpdateStatusTone(status: UpdateCheckResult["status"]) {
  switch (status) {
    case "error":
      return "danger";
    case "available":
      return "success";
    case "checking":
    case "downloaded":
      return "info";
    default:
      return "neutral";
  }
}
