// ============================================================
// LaunchPage — 应用启动页 / 应用目录页
// ============================================================
// 这里负责“选应用、搜应用、看应用分组”，
// 不直接持有业务实例，只负责把用户导向实例创建动作。

import { useUIStore } from "../../store";
import { CustomAppModal } from "./components/CustomAppModal";
import { LaunchCatalog } from "./components/LaunchCatalog";
import { LaunchHero } from "./components/LaunchHero";
import { LaunchSearchBar } from "./components/LaunchSearchBar";
import { useLaunchPageState } from "./useLaunchPageState";

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const {
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
    appsCount,
  } = useLaunchPageState(snapshot);

  if (!snapshot) {
    return (
      <div className="flex h-full w-full bg-[var(--color-bg-primary)]">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--color-bg-primary)]">
      <main
        className="flex-1 overflow-y-auto px-8 py-8 md:px-12 lg:px-16"
        style={{
          paddingLeft: "clamp(1rem, 2vw, 2rem)",
          paddingRight: "clamp(1rem, 2vw, 2rem)",
        }}
      >
        <div
          className="mx-auto flex w-full flex-col pb-12"
          style={{ gap: "28px" }}
        >
          <LaunchHero
            viewReleasePolicy={viewReleasePolicy}
            updateState={updateState}
            isCheckingUpdate={isCheckingUpdate}
            customAppFeedback={customAppFeedback}
            onViewReleasePolicyChange={handleViewReleasePolicyChange}
            onCheckForUpdates={handleCheckForUpdates}
          />

          <LaunchSearchBar
            value={searchQuery}
            placeholder={`搜索 AI 应用... 当前已接入 ${appsCount} 个，其中自定义 ${customAppsCount} 个`}
            onChange={setSearchQuery}
          />

          <LaunchCatalog
            groups={appGroups}
            searchQuery={searchQuery}
            pinnedAppIds={pinnedAppIds}
            onOpenCustomAppDialog={openCustomAppDialog}
            onTogglePin={(id) => window.api.togglePinApp(id)}
            onSubmitReview={handleSubmitCustomAppForReview}
            onDeleteCustomApp={handleDeleteCustomApp}
          />
        </div>
      </main>
      <CustomAppModal
        isOpen={isCustomAppDialogOpen}
        draft={customAppDraft}
        error={customAppError}
        isSaving={isSavingCustomApp}
        onChange={handleCustomAppFieldChange}
        onClose={closeCustomAppDialog}
        onSave={handleSaveCustomApp}
      />
    </div>
  );
}
