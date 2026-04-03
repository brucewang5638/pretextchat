// ============================================================
// Sidebar — 左侧应用导航栏
// ============================================================
// 这里承担两个导航角色：
// 1. 回到启动页
// 2. 在“已有实例 / 已固定应用 / Google 登录入口”之间快速跳转

import { useUIStore } from "../../../store";
import type { DropResult } from "@hello-pangea/dnd";
import type { MouseEvent } from "react";
import { SidebarAppList } from "./SidebarAppList";
import { SidebarHomeButton } from "./SidebarHomeButton";
import { buildSidebarModel } from "./sidebar.helpers";

export function Sidebar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  const { apps, instancesByAppId } = buildSidebarModel(snapshot);

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

  const handleCloseAppIcon = async (
    event: MouseEvent<HTMLButtonElement>,
    appId: string,
  ) => {
    event.stopPropagation();

    // 找到并关闭此应用的所有实例
    const instances = instancesByAppId.get(appId) ?? [];
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
      <SidebarHomeButton
        isActive={currentPage === "launch"}
        onClick={handleGoHome}
      />

      <div
        aria-hidden="true"
        className="mb-5 mt-2 w-11 shrink-0 border-b border-[rgba(148,163,184,0.5)] pb-2"
      />

      <SidebarAppList
        apps={apps}
        activeAppId={currentPage === "workbench" ? activeAppFilter : null}
        onDragEnd={onDragEnd}
        onSelectApp={handleSelectApp}
        onCloseApp={handleCloseAppIcon}
      />
    </aside>
  );
}
