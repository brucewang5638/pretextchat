// ============================================================
// Sidebar — 左侧应用导航栏
// ============================================================
// 这里承担两个导航角色：
// 1. 回到启动页
// 2. 在“已有实例 / 已固定应用 / Google 登录入口”之间快速跳转

import { useUIStore } from "../../store";
import { resolveAssetPath } from "../../lib/assets";
import { BRAND_LOGO_ASSET_PATH } from "../../../shared/branding";

export function Sidebar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  // 侧边栏不是“展示全部应用目录”，而是只展示当前工作流真正相关的入口。
  const activeAppIds = new Set(
    snapshot?.workspace.instances.map((inst) => inst.applicationId) || [],
  );
  const pinnedAppIds = new Set(snapshot?.preferences.pinnedAppIds || []);
  // Google 登录容器始终给一个稳定入口，避免用户在第三方站点里找不到入口。
  const displayAppIds = new Set([...activeAppIds, ...pinnedAppIds, "google"]);
  const apps = (snapshot?.apps || []).filter((app) =>
    displayAppIds.has(app.id),
  );

  const handleGoHome = async () => {
    await window.api.switchInstance(null);
    setActiveAppFilter(null);
    setCurrentPage("launch");
  };

  const handleSelectApp = async (appId: string) => {
    setActiveAppFilter(appId);

    const instancesForApp =
      snapshot?.workspace.instances.filter((i) => i.applicationId === appId) ||
      [];
    if (instancesForApp.length > 0) {
      // 如果该应用已经有实例，侧边栏点击的语义是“切回这个应用的工作上下文”。
      await window.api.switchInstance(instancesForApp[0].id);
    } else {
      // 否则直接代替用户创建一个新实例，让入口行为保持“总能打开”。
      await window.api.createInstance(appId);
    }

    setCurrentPage("workbench");
  };

  return (
    <aside className="z-[100] flex h-screen w-[68px] shrink-0 flex-col items-center overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-page)] py-4 [&::-webkit-scrollbar]:hidden">
      <button
        className={[
          "mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-transparent bg-transparent text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
          currentPage === "launch"
            ? "bg-[var(--color-bg-active)] text-[var(--color-accent)]"
            : "",
        ].join(" ")}
        onClick={handleGoHome}
        title="应用主页"
      >
        <img
          src={resolveAssetPath(BRAND_LOGO_ASSET_PATH)}
          alt="PretextChat"
          className="block h-full w-full object-contain p-1"
        />
      </button>

      <div
        aria-hidden="true"
        className="mb-5 mt-2 w-11 shrink-0 border-b border-[rgba(148,163,184,0.5)] pb-2"
      />

      {apps.map((app) => {
        const isActive =
          currentPage === "workbench" && activeAppFilter === app.id;
        return (
          <div
            key={app.id}
            className="group relative mb-3 flex h-12 w-12 cursor-pointer items-center justify-center"
            onClick={() => handleSelectApp(app.id)}
            title={app.name}
          >
            <div
              className={[
                "absolute -left-[14px] top-1/2 w-1.5 -translate-y-1/2 rounded-r bg-[var(--color-accent)] transition-all duration-200",
                isActive ? "h-9" : "h-0 group-hover:h-6",
              ].join(" ")}
            />
            <div
              className={[
                "flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border-2 border-transparent bg-[var(--color-bg-elevated)] text-sm font-bold text-[var(--color-text-secondary)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:rounded-[16px] group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
                isActive
                  ? "rounded-[16px] border-[var(--color-accent)] shadow-[0_12px_28px_rgba(59,130,246,0.16)]"
                  : "",
              ].join(" ")}
            >
              {app.image ? (
                <img
                  src={resolveAssetPath(app.image)}
                  alt={app.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                app.name.charAt(0)
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
