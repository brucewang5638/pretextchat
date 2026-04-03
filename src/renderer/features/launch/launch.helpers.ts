import type {
  Application,
  UpdateCheckResult,
} from "../../../shared/types";
import { CUSTOM_APP_LAUNCHER_ID } from "./launch.constants";
import type { LaunchAppGroup } from "./launch.types";

const CATEGORY_PRIORITY: string[] = [
  "身份登录",
  "自定义应用",
  "AI 助手",
  "搜索引擎",
  "知识助手",
  "智能体平台",
  "开发工具",
  "模型平台",
  "自动化",
  "未分类",
];

function getCategoryRank(category: string): number {
  const index = CATEGORY_PRIORITY.indexOf(category);
  return index === -1 ? CATEGORY_PRIORITY.length : index;
}

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
  })).sort((a, b) => {
    const rankDiff = getCategoryRank(a.category) - getCategoryRank(b.category);
    if (rankDiff !== 0) return rankDiff;
    return a.category.localeCompare(b.category, "zh-CN");
  });
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
