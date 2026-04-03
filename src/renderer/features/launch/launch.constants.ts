import type { Preferences } from "../../../shared/types";
import type { CustomAppForm } from "./launch.types";

export const CUSTOM_APP_LAUNCHER_ID = "custom-app-launcher";

export const VIEW_RELEASE_POLICY_OPTIONS: Array<{
  value: NonNullable<Preferences["viewReleasePolicy"]>;
  label: string;
}> = [
  { value: "balanced", label: "平衡" },
  { value: "memorySaver", label: "节省内存" },
  { value: "performance", label: "性能优先" },
];

export function createDefaultCustomAppForm(): CustomAppForm {
  return {
    name: "",
    startUrl: "https://",
    category: "自定义应用",
    description: "",
  };
}
