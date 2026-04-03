// ============================================================
// Sidebar — 左侧应用导航栏
// ============================================================
// 这里承担两个导航角色：
// 1. 回到启动页
// 2. 在“已有实例 / 已固定应用 / Google 登录入口”之间快速跳转

import { useUIStore } from "../../store";
import { resolveAssetPath } from "../../lib/assets";
import { BRAND_LOGO_ASSET_PATH } from "../../../shared/branding";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export function Sidebar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  const activeAppIds = new Set(
    snapshot?.workspace.instances.map((inst) => inst.applicationId) || [],
  );
  const pinnedAppIds = new Set(snapshot?.preferences.pinnedAppIds || []);
  const displayAppIds = new Set([...activeAppIds, ...pinnedAppIds]);
  
  const unsortedApps = (snapshot?.apps || []).filter((app) =>
    displayAppIds.has(app.id),
  );

  const customOrder = snapshot?.preferences.customSidebarOrder || [];
  const apps = [...unsortedApps].sort((a, b) => {
    const aIndex = customOrder.indexOf(a.id);
    const bIndex = customOrder.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0; // retain original relative order for unsorted items
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newApps = Array.from(apps);
    const [removed] = newApps.splice(sourceIndex, 1);
    newApps.splice(destinationIndex, 0, removed);

    const orderedIds = newApps.map(a => a.id);
    window.api.updateSidebarOrder(orderedIds);
  };

  const handleCloseAppIcon = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();

    // 找到并关闭此应用的所有实例
    const instances = snapshot?.workspace.instances.filter(i => i.applicationId === appId) || [];
    for (const inst of instances) {
      await window.api.closeInstance(inst.id);
    }

    // 如果应用被固定了，同时也取消固定
    const isPinned = snapshot?.preferences.pinnedAppIds.includes(appId);
    if (isPinned) {
      await window.api.togglePinApp(appId);
    }

    // 如果正在工作台中且正好显示的是这个应用，则跳回主页
    if (currentPage === 'workbench' && activeAppFilter === appId) {
      setActiveAppFilter(null);
      setCurrentPage('launch');
    }
  };

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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sidebar-apps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex w-full flex-col items-center"
            >
              {apps.map((app, index) => {
                const isActive =
                  currentPage === "workbench" && activeAppFilter === app.id;
                return (
                  <Draggable key={app.id} draggableId={app.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={[
                          "group relative mb-3 flex h-12 w-12 cursor-pointer items-center justify-center select-none",
                          snapshot.isDragging ? "z-50" : "",
                        ].join(" ")}
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
                            "flex h-10 w-10 relative items-center justify-center overflow-hidden rounded-[12px] border-2 border-transparent bg-[var(--color-bg-elevated)] text-sm font-bold text-[var(--color-text-secondary)] transition-all duration-200",
                            snapshot.isDragging
                              ? "rounded-[16px] scale-110 shadow-[0_20px_40px_rgba(15,23,42,0.2)] bg-white border-[rgba(148,163,184,0.4)]"
                              : "group-hover:-translate-y-0.5 group-hover:rounded-[16px] group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
                            isActive && !snapshot.isDragging
                              ? "rounded-[16px] border-[var(--color-accent)] shadow-[0_12px_28px_rgba(59,130,246,0.16)] text-[var(--color-accent)] bg-white"
                              : "",
                          ].join(" ")}
                        >
                          {app.image ? (
                            <img
                              src={resolveAssetPath(app.image)}
                              alt={app.name}
                              className="h-full w-full object-contain pointer-events-none"
                            />
                          ) : (
                            app.name.charAt(0)
                          )}
                        </div>

                        {/* 一键关闭按钮 */}
                        <button
                          className="absolute -right-2 -top-2 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-white shadow-md transition-all hover:scale-110 group-hover:flex"
                          onClick={(e) => handleCloseAppIcon(e, app.id)}
                          title={`关闭并移除 ${app.name}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </aside>
  );
}
