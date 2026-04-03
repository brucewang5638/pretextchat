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

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const [searchQuery, setSearchQuery] = useState("");
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
          <section className="grid items-center gap-7 rounded-[30px] border border-[rgba(148,163,184,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(110,231,216,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(24,58,78,0.96))] px-8 py-7 shadow-[0_22px_48px_rgba(15,23,42,0.16)] md:grid-cols-[auto_1fr] md:px-9">
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
                一站式聚合所有 AI 会话{" "}
                <span className="mx-2 opacity-50">|</span> All AI Chats in One
                App
              </p>
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
