import type { ChangeEvent } from "react";
import type {
  LaunchAtLoginState,
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
    <section className="grid items-center gap-6 rounded-[30px] border border-[rgba(148,163,184,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(110,231,216,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(24,58,78,0.96))] px-8 py-6 shadow-[0_22px_48px_rgba(15,23,42,0.16)] md:grid-cols-[auto_1fr_minmax(280px,320px)] md:px-9">
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

      <div className="mt-1 flex w-full max-w-[460px] flex-col gap-2.5 md:mt-0 md:justify-self-end md:pl-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[rgba(226,232,240,0.95)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-[0.18em] text-white/55">
                  开机自启
                </p>
                <p className="mt-0.5 text-[14px] font-medium leading-tight text-white/90">
                  {launchAtLoginEnabled ? "已开启" : "已关闭"}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={launchAtLoginEnabled}
                disabled={!launchAtLoginSupported || isUpdatingLaunchAtLogin}
                onClick={() => void onLaunchAtLoginChange(!launchAtLoginEnabled)}
                className={[
                  "inline-flex shrink-0 items-center rounded-full px-1.5 py-1 transition-all duration-200",
                  launchAtLoginEnabled
                    ? "bg-emerald-400/20"
                    : "bg-white/10",
                  !launchAtLoginSupported || isUpdatingLaunchAtLogin
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-white/15",
                ].join(" ")}
              >
                <span
                  className={[
                    "relative h-6 w-11 rounded-full transition-colors duration-200",
                    launchAtLoginEnabled
                      ? "bg-emerald-500/80"
                      : "bg-white/15",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-1 top-1 block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                      launchAtLoginEnabled ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>

            {launchAtLoginState && (
              <div className="mt-1.5 flex items-start gap-2 text-[11.5px] leading-[1.25] text-white/68">
                <span
                  className={[
                    "mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]",
                    launchAtLoginTone === "success"
                      ? "bg-emerald-300 text-emerald-300"
                      : launchAtLoginTone === "warning"
                        ? "bg-amber-300 text-amber-300"
                        : "bg-slate-300 text-slate-300",
                    isUpdatingLaunchAtLogin ? "animate-pulse" : "",
                  ].join(" ")}
                />
                <p className="min-w-0 leading-[1.25] text-white/68">
                  {launchAtLoginState.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[12.5px] font-medium tracking-wide text-[rgba(226,232,240,0.95)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-[0.18em] text-white/55">
                标签内存
              </p>
              <p className="mt-0.5 text-[14px] font-medium leading-tight text-white/90">
                当前策略
              </p>
            </div>

            <select
              value={viewReleasePolicy}
              onChange={handleChange}
              className="min-w-0 cursor-pointer rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-[13px] font-semibold text-white outline-none transition hover:bg-[rgba(255,255,255,0.12)]"
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => void onCheckForUpdates()}
            disabled={isCheckingUpdate}
            className="group relative inline-flex min-h-[56px] w-full cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-white/[0.05] px-4 py-2.5 text-[13px] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-white/10 ring-inset backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/[0.09] hover:ring-white/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
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
              {isCheckingUpdate ? "探测中..." : "检查更新"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => void onClearEmbeddedSiteData()}
            disabled={isClearingSiteData}
            className="group relative inline-flex min-h-[56px] w-full cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-[rgba(248,113,113,0.12)] px-4 py-2.5 text-[13px] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-[rgba(248,113,113,0.22)] ring-inset backdrop-blur-md transition-all duration-300 ease-out hover:bg-[rgba(248,113,113,0.18)] hover:ring-[rgba(248,113,113,0.35)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
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
        </div>

        {updateState && (
          <div className="w-full animate-in fade-in slide-in-from-right-2 duration-300 ease-out">
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
