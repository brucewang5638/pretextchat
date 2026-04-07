import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type {
  MaintenanceActionResult,
  Preferences,
  LaunchAtLoginState,
  ReviewSubmissionResult,
  StateSnapshot,
  UpdateCheckResult,
} from "../../../shared/types";
import { createDefaultCustomAppForm } from "./launch.constants";
import { buildLaunchAppGroups } from "./launch.helpers";
import type { CustomAppForm } from "./launch.types";

export function useLaunchPageState(snapshot: StateSnapshot | null) {
  const apps = snapshot?.apps ?? [];
  const viewReleasePolicy = snapshot?.preferences.viewReleasePolicy ?? "balanced";
  const customAppsCount = snapshot?.preferences.customApps?.length ?? 0;
  const [launchAtLoginState, setLaunchAtLoginState] =
    useState<LaunchAtLoginState | null>(null);
  const [isUpdatingLaunchAtLogin, setIsUpdatingLaunchAtLogin] = useState(false);
  const pinnedAppIds = useMemo(
    () => new Set(snapshot?.preferences.pinnedAppIds ?? []),
    [snapshot?.preferences.pinnedAppIds],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [updateState, setUpdateState] = useState<UpdateCheckResult | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [maintenanceState, setMaintenanceState] =
    useState<MaintenanceActionResult | null>(null);
  const [isClearingSiteData, setIsClearingSiteData] = useState(false);
  const [isCustomAppDialogOpen, setIsCustomAppDialogOpen] = useState(false);
  const [customAppDraft, setCustomAppDraft] = useState<CustomAppForm>(
    createDefaultCustomAppForm,
  );
  const [customAppError, setCustomAppError] = useState<string | null>(null);
  const [customAppFeedback, setCustomAppFeedback] = useState<string | null>(null);
  const [isSavingCustomApp, setIsSavingCustomApp] = useState(false);

  useEffect(() => {
    let isActive = true;
    void window.api
      .getLaunchAtLoginState()
      .then((state) => {
        if (isActive) {
          setLaunchAtLoginState(state);
        }
      })
      .catch(() => {
        if (isActive) {
          setLaunchAtLoginState(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const appGroups = useMemo(
    () => buildLaunchAppGroups(apps, deferredSearchQuery),
    [apps, deferredSearchQuery],
  );

  const resetCustomAppDraft = () => {
    setCustomAppDraft(createDefaultCustomAppForm());
    setCustomAppError(null);
  };

  const openCustomAppDialog = () => {
    setCustomAppFeedback(null);
    setIsCustomAppDialogOpen(true);
  };

  const closeCustomAppDialog = () => {
    setIsCustomAppDialogOpen(false);
    resetCustomAppDraft();
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateState({
      status: "checking",
      message: "正在检查更新...",
    });

    try {
      const result = await window.api.checkForUpdates();
      setUpdateState(result);
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "检查更新失败。",
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleViewReleasePolicyChange = async (
    value: NonNullable<Preferences["viewReleasePolicy"]>,
  ) => {
    await window.api.setViewReleasePolicy(value);
  };

  const handleClearEmbeddedSiteData = async () => {
    if (
      !window.confirm(
        "这会清空所有嵌入应用的登录态、Cookie、缓存和离线数据。确认继续吗？",
      )
    ) {
      return;
    }

    setIsClearingSiteData(true);
    setMaintenanceState(null);

    try {
      const result = await window.api.clearEmbeddedSiteData();
      setMaintenanceState(result);
    } catch (error) {
      setMaintenanceState({
        status: "error",
        message: error instanceof Error ? error.message : "清理站点数据失败。",
      });
    } finally {
      setIsClearingSiteData(false);
    }
  };

  const handleCustomAppFieldChange = (
    field: keyof CustomAppForm,
    value: string,
  ) => {
    setCustomAppDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveCustomApp = async () => {
    setIsSavingCustomApp(true);
    setCustomAppError(null);
    setCustomAppFeedback(null);

    try {
      await window.api.upsertCustomApp(customAppDraft);
      setCustomAppFeedback("自定义应用已加入目录。");
      closeCustomAppDialog();
    } catch (error) {
      setCustomAppError(
        error instanceof Error ? error.message : "保存自定义应用失败。",
      );
    } finally {
      setIsSavingCustomApp(false);
    }
  };

  const handleDeleteCustomApp = async (id: string) => {
    if (!window.confirm("确认删除这个自定义应用吗？")) return;
    await window.api.deleteCustomApp(id);
    setCustomAppFeedback("自定义应用已删除。");
  };

  const handleSubmitCustomAppForReview = async (id: string) => {
    const result: ReviewSubmissionResult =
      await window.api.submitCustomAppForReview(id);
    setCustomAppFeedback(result.message);
  };

  return {
    searchQuery,
    setSearchQuery,
    updateState,
    isCheckingUpdate,
    handleCheckForUpdates,
    maintenanceState,
    isClearingSiteData,
    handleClearEmbeddedSiteData,
    viewReleasePolicy,
    handleViewReleasePolicyChange,
    customAppsCount,
    appGroups,
    pinnedAppIds,
    launchAtLoginState,
    isUpdatingLaunchAtLogin,
    handleLaunchAtLoginChange,
    isCustomAppDialogOpen,
    openCustomAppDialog,
    closeCustomAppDialog,
    customAppDraft,
    customAppError,
    customAppFeedback,
    isSavingCustomApp,
    handleCustomAppFieldChange,
    handleSaveCustomApp,
    handleDeleteCustomApp,
    handleSubmitCustomAppForReview,
    appsCount: apps.length,
  };
}
