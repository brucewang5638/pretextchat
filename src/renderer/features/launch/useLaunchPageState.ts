import { useDeferredValue, useMemo, useState } from "react";
import type {
  Preferences,
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
  const pinnedAppIds = useMemo(
    () => new Set(snapshot?.preferences.pinnedAppIds ?? []),
    [snapshot?.preferences.pinnedAppIds],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [updateState, setUpdateState] = useState<UpdateCheckResult | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isCustomAppDialogOpen, setIsCustomAppDialogOpen] = useState(false);
  const [customAppDraft, setCustomAppDraft] = useState<CustomAppForm>(
    createDefaultCustomAppForm,
  );
  const [customAppError, setCustomAppError] = useState<string | null>(null);
  const [customAppFeedback, setCustomAppFeedback] = useState<string | null>(null);
  const [isSavingCustomApp, setIsSavingCustomApp] = useState(false);

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
    viewReleasePolicy,
    handleViewReleasePolicyChange,
    customAppsCount,
    appGroups,
    pinnedAppIds,
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
