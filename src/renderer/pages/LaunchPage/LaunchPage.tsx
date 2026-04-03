// ============================================================
// LaunchPage — 应用启动页 / 应用目录页
// ============================================================
// 这里负责“选应用、搜应用、看应用分组”，
// 不直接持有业务实例，只负责把用户导向实例创建动作。

import { useState, useMemo } from "react";
import { useUIStore } from "../../store";
import { AppCard } from "../../components/AppCard/AppCard";
import { resolveAssetPath } from "../../lib/assets";
import { BRAND_LOGO_ASSET_PATH } from "../../../shared/branding";
import type { UpdateCheckResult } from "../../../shared/types";

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateState, setUpdateState] = useState<UpdateCheckResult | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const apps = snapshot?.apps ?? [];

  // 搜索是纯前端派生态，不需要落主进程；
  // 这样输入反馈会更直接，也不会污染业务真相源。
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const lowerQuery = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(lowerQuery) ||
        (app.description &&
          app.description.toLowerCase().includes(lowerQuery)) ||
        (app.category && app.category.toLowerCase().includes(lowerQuery)),
    );
  }, [apps, searchQuery]);

  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      if (a.id === "google") return -1;
      if (b.id === "google") return 1;
      return a.name.localeCompare(b.name, "zh-CN");
    });
  }, [filteredApps]);

  // 分组统计跟随过滤结果实时变化，让用户看到“当前筛选后还剩哪些类别”。
  const groupsInfo = useMemo(() => {
    return sortedApps.reduce(
      (acc, app) => {
        const cat = app.category || "未分类";
        if (!acc[cat]) acc[cat] = 0;
        acc[cat]++;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [sortedApps]);

  if (!snapshot) {
    return (
      <div className="flex h-full w-full bg-[var(--color-bg-primary)]">
        加载中...
      </div>
    );
  }

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
              <p className="max-w-[760px] text-[15px] font-medium tracking-wide leading-7 text-[rgba(226,232,240,0.9)]">
                一站式聚合所有 AI 会话 <span className="mx-2 opacity-50">|</span> All AI Chats in One App
              </p>
            </div>

            <div className="mt-2 flex flex-col items-start gap-3 md:mt-0 md:items-end md:pl-4">
              <button
                type="button"
                onClick={handleCheckForUpdates}
                disabled={isCheckingUpdate}
                className="group relative inline-flex cursor-pointer select-none items-center gap-2 overflow-hidden rounded-full bg-white/[0.05] px-4 py-2 text-[13px] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-white/10 ring-inset backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/[0.09] hover:ring-white/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                style={{
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {/* Subtle Glow Background on Hover */}
                <div className="absolute inset-x-0 bottom-0 -z-10 h-full origin-bottom translate-y-full bg-gradient-to-t from-[rgba(110,231,216,0.15)] to-transparent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
                
                {/* Icon with Action Micro-Animation */}
                <svg 
                  className={`h-4 w-4 text-[rgba(110,231,216,0.9)] transition-transform duration-500 ${isCheckingUpdate ? 'animate-spin' : 'group-hover:rotate-180'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  {isCheckingUpdate ? (
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  ) : (
                    <>
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </>
                  )}
                </svg>
                
                <span className="relative z-10">{isCheckingUpdate ? "极速探测中..." : "检查更新"}</span>
              </button>

              {/* Status Pill Indicator */}
              {updateState && (
                <div className="flex animate-in fade-in slide-in-from-right-2 duration-300 ease-out items-center gap-2 rounded-full border border-white/5 bg-black/20 px-3 py-[7px] backdrop-blur-sm shadow-inner">
                  <span 
                    className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                      updateState.status === 'error' ? 'bg-rose-400 text-rose-400' :
                      updateState.status === 'available' ? 'bg-emerald-400 text-emerald-400 animate-pulse' :
                      updateState.status === 'checking' ? 'bg-blue-400 text-blue-400 animate-pulse' :
                      updateState.status === 'downloaded' ? 'bg-cyan-400 text-cyan-400' :
                      'bg-slate-400 text-slate-400'
                    }`} 
                  />
                  <span className="text-[12.5px] font-medium tracking-wide text-[rgba(226,232,240,0.95)]">
                    {updateState.message}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Top Search Bar */}
          <div
            className="flex items-center rounded-[32px] border border-[rgba(148,163,184,0.22)] bg-white/92 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-200 focus-within:border-[rgba(59,130,246,0.3)] focus-within:bg-white focus-within:shadow-[0_14px_36px_rgba(59,130,246,0.12)]"
            style={{ padding: "8px 32px" }}
          >
            <svg
              className="flex-shrink-0 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent)] transition-colors duration-200"
              style={{ width: "28px", height: "28px", marginRight: "8px" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="搜索 AI 应用..."
              className="flex-1 border-none bg-transparent font-medium text-[var(--color-text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--color-text-muted)]"
              style={{ padding: "8px 16px", fontSize: "18px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Applications Clustered by Category */}
          <div className="flex flex-col gap-10">
            {Object.keys(groupsInfo).length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[rgba(148,163,184,0.32)] bg-white/55 px-6 py-12 text-[var(--color-text-muted)] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                没有找到与 "{searchQuery}" 相关的应用
              </div>
            ) : (
              Object.entries(groupsInfo).map(([category, count]) => {
                const categoryApps = sortedApps.filter(
                  (a) => (a.category || "未分类") === category,
                );

                return (
                  <section key={category} className="flex flex-col gap-[18px]">
                    <div className="flex items-end gap-2.5 px-1">
                      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                        {category}
                      </h2>
                      <span className="pb-0.5 text-[14px] text-[var(--color-text-muted)]">
                        {count} 个应用
                      </span>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
                      {categoryApps.map((app) => (
                        <AppCard
                          key={app.id}
                          id={app.id}
                          name={app.name}
                          icon={app.icon}
                          image={app.image}
                          category={app.category}
                          description={app.description}
                          isPinned={snapshot.preferences?.pinnedAppIds?.includes(
                            app.id,
                          )}
                          onTogglePin={(id) => window.api.togglePinApp(id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
