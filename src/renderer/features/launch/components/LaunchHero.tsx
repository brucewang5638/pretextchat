import type { ChangeEvent } from "react";
import type {
  MaintenanceActionResult,
  Preferences,
  UpdateCheckResult,
} from "../../../../shared/types";
import { BRAND_LOGO_ASSET_PATH } from "../../../../shared/branding";
import { resolveAssetPath } from "../../../shared/asset-path";
import { StatusPill } from "../../../shared/ui/StatusPill";
import { RefreshIcon, SpinnerArcIcon, TrashIcon } from "../../../shared/ui/icons";
import {
  VIEW_RELEASE_POLICY_OPTIONS,
} from "../launch.constants";
import { getUpdateStatusTone } from "../launch.helpers";

interface LaunchHeroProps {
  viewReleasePolicy: NonNullable<Preferences["viewReleasePolicy"]>;
  updateState: UpdateCheckResult | null;
  isCheckingUpdate: boolean;
  maintenanceState: MaintenanceActionResult | null;
  isClearingSiteData: boolean;
  customAppFeedback: string | null;
  launchAtLoginState: LaunchAtLoginState | null;
  isUpdatingLaunchAtLogin: boolean;
  onViewReleasePolicyChange: (
    value: NonNullable<Preferences["viewReleasePolicy"]>,
  ) => void | Promise<void>;
  onLaunchAtLoginChange: (value: boolean) => void | Promise<void>;
  onCheckForUpdates: () => void | Promise<void>;
  onClearEmbeddedSiteData: () => void | Promise<void>;
}

export function LaunchHero({
  viewReleasePolicy,
  updateState,
  isCheckingUpdate,
  maintenanceState,
  isClearingSiteData,
  customAppFeedback,
  launchAtLoginState,
  isUpdatingLaunchAtLogin,
  onViewReleasePolicyChange,
  onLaunchAtLoginChange,
  onCheckForUpdates,
  onClearEmbeddedSiteData,
}: LaunchHeroProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void onViewReleasePolicyChange(
      event.target.value as NonNullable<Preferences["viewReleasePolicy"]>,
    );
  };

  const launchAtLoginEnabled = launchAtLoginState?.enabled ?? false;
  const launchAtLoginSupported = launchAtLoginState?.supported ?? true;
  const launchAtLoginTone: "neutral" | "success" | "warning" = !launchAtLoginSupported
    ? "warning"
    : launchAtLoginEnabled
      ? "success"
      : "neutral";

  return (
    <section className="grid items-center gap-7 rounded-[30px] border border-[rgba(148,163,184,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(110,231,216,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(24,58,78,0.96))] px-8 py-7 shadow-[0_22px_48px_rgba(15,23,42,0.16)] md:grid-cols-[auto_1fr_auto] md:px-9">
      <div className="h-[84px] w-[84px] rounded-[28px] bg-white/10 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] max-md:h-16 max-md:w-16">
        <img
          src={resolveAssetPath(BRAND_LOGO_ASSET_PATH)}
          alt="PretextChat"
          className="block h-full w-full"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2.5">
        <h1 className="text-[32px] font-bold leading-none tracking-[-0.045em] text-slate-50 max-md:text-[26px]">
          PretextChat
        </h1>
        <p className="max-w-[760px] text-[15px] font-medium leading-7 tracking-wide text-[rgba(226,232,240,0.9)]">
          一站式聚合所有 AI 会话 <span className="mx-2 opacity-50">|</span> All AI Chats in One App
        </p>
      </div>

      <div className="mt-2 flex flex-col items-start gap-3 md:mt-0 md:items-end md:pl-4">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] font-medium tracking-wide text-[rgba(226,232,240,0.95)] backdrop-blur-md">
          <span className="whitespace-nowrap text-white/75">开机自启</span>
          <button
            type="button"
            role="switch"
            aria-checked={launchAtLoginEnabled}
            disabled={!launchAtLoginSupported || isUpdatingLaunchAtLogin}
            onClick={() => void onLaunchAtLoginChange(!launchAtLoginEnabled)}
            className={[
              "inline-flex items-center gap-2 rounded-full px-2 py-1 text-[12.5px] font-semibold tracking-wide transition-all duration-200",
              launchAtLoginEnabled
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-white/5 text-slate-200",
              !launchAtLoginSupported || isUpdatingLaunchAtLogin
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-white/10",
            ].join(" ")}
          >
            <span
              className={[
                "relative h-5 w-9 rounded-full p-0.5 transition-colors duration-200",
                launchAtLoginEnabled
                  ? "bg-emerald-500/80"
                  : "bg-white/15",
              ].join(" ")}
            >
              <span
                className={[
                  "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  launchAtLoginEnabled ? "translate-x-4" : "translate-x-0",
                ].join(" ")}
              />
            </span>
            <span className="min-w-[3.5rem] text-left">
              {launchAtLoginEnabled ? "已开启" : "已关闭"}
            </span>
          </button>
        </div>

        {launchAtLoginState && (
          <StatusPill
            message={launchAtLoginState.message}
            tone={launchAtLoginTone}
            animated={isUpdatingLaunchAtLogin}
          />
        )}

        <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[12.5px] font-medium tracking-wide text-[rgba(226,232,240,0.95)] backdrop-blur-md">
          <span className="whitespace-nowrap text-white/75">标签内存</span>
          <select
            value={viewReleasePolicy}
            onChange={handleChange}
            className="cursor-pointer appearance-none bg-transparent pr-4 text-[12.5px] font-semibold text-white outline-none"
          >
            {VIEW_RELEASE_POLICY_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-900 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => void onCheckForUpdates()}
          disabled={isCheckingUpdate}
          className="group relative inline-flex cursor-pointer select-none items-center gap-2 overflow-hidden rounded-full bg-white/[0.05] px-4 py-2 text-[13px] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-white/10 ring-inset backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/[0.09] hover:ring-white/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          style={{
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 -z-10 h-full origin-bottom translate-y-full bg-gradient-to-t from-[rgba(110,231,216,0.15)] to-transparent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
          <span
            className={[
              "relative z-10 flex h-4 w-4 items-center justify-center text-[rgba(110,231,216,0.9)] transition-transform duration-500",
              isCheckingUpdate ? "animate-spin" : "group-hover:rotate-180",
            ].join(" ")}
          >
            {isCheckingUpdate ? (
              <SpinnerArcIcon size={16} />
            ) : (
              <RefreshIcon size={16} />
            )}
          </span>
          <span className="relative z-10">
            {isCheckingUpdate ? "极速探测中..." : "检查更新"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => void onClearEmbeddedSiteData()}
          disabled={isClearingSiteData}
          className="group relative inline-flex cursor-pointer select-none items-center gap-2 overflow-hidden rounded-full bg-[rgba(248,113,113,0.12)] px-4 py-2 text-[13px] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-[rgba(248,113,113,0.22)] ring-inset backdrop-blur-md transition-all duration-300 ease-out hover:bg-[rgba(248,113,113,0.18)] hover:ring-[rgba(248,113,113,0.35)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <span
            className={[
              "relative z-10 flex h-4 w-4 items-center justify-center text-[rgba(254,202,202,0.95)] transition-transform duration-300",
              isClearingSiteData ? "animate-pulse" : "group-hover:scale-110",
            ].join(" ")}
          >
            <TrashIcon size={16} />
          </span>
          <span className="relative z-10">
            {isClearingSiteData ? "正在清理..." : "清理站点数据"}
          </span>
        </button>

        {updateState && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 ease-out">
            <StatusPill
              message={updateState.message}
              tone={getUpdateStatusTone(updateState.status)}
              animated={
                updateState.status === "available" ||
                updateState.status === "checking"
              }
            />
          </div>
        )}

        {maintenanceState && (
          <StatusPill
            message={maintenanceState.message}
            tone={maintenanceState.status === "success" ? "success" : "danger"}
          />
        )}

        {customAppFeedback && (
          <StatusPill message={customAppFeedback} tone="info" />
        )}
      </div>
    </section>
  );
}
