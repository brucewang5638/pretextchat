import type { CustomAppRecord } from "../../shared/types";

export const CUSTOM_APP_REVIEW_URL =
  "https://github.com/brucewang5638/pretextchat/issues/new";

export function normalizeCustomAppDraft(
  value: unknown,
): Pick<CustomAppRecord, "name" | "startUrl" | "category" | "description"> {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid custom app payload");
  }

  const draft = value as Record<string, unknown>;
  if (typeof draft.name !== "string" || draft.name.trim().length === 0) {
    throw new Error("Custom app name is required");
  }
  if (typeof draft.startUrl !== "string" || draft.startUrl.trim().length === 0) {
    throw new Error("Custom app startUrl is required");
  }

  let startUrl: string;
  try {
    const parsed = new URL(draft.startUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Custom app URL must start with http:// or https://");
    }
    startUrl = parsed.toString();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Custom app URL is invalid",
    );
  }

  return {
    name: draft.name.trim(),
    startUrl,
    category:
      typeof draft.category === "string" && draft.category.trim().length > 0
        ? draft.category.trim()
        : "自定义应用",
    description:
      typeof draft.description === "string" && draft.description.trim().length > 0
        ? draft.description.trim()
        : undefined,
  };
}

export function createCustomAppId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return `custom-${slug || "app"}-${Date.now().toString(36)}`;
}

export function buildCustomAppReviewIssueUrl(app: CustomAppRecord): string {
  const issueUrl = new URL(CUSTOM_APP_REVIEW_URL);
  issueUrl.searchParams.set("labels", "custom-app-review");
  issueUrl.searchParams.set("title", `Custom app review: ${app.name}`);
  issueUrl.searchParams.set(
    "body",
    [
      "## 自定义应用审核申请",
      "",
      `- 名称：${app.name}`,
      `- 入口：${app.startUrl}`,
      `- 分类：${app.category || "自定义应用"}`,
      `- 描述：${app.description || "无"}`,
      "",
      "```json",
      JSON.stringify(app, null, 2),
      "```",
    ].join("\n"),
  );
  return issueUrl.toString();
}
