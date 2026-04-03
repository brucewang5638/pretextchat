// ============================================================
// AppCard — 启动页上的应用入口卡片
// ============================================================
// 这张卡片的核心职责很简单：
// 点击后直接创建实例，并把 UI 切到工作台。

import { useUIStore } from "../../../../store";
import type { KeyboardEvent } from "react";
import { AppCardActions } from "./AppCardActions";
import { AppCardPreview } from "./AppCardPreview";
import type { AppCardProps } from "./app-card.types";

export function AppCard({
  id,
  name,
  icon,
  image,
  description,
  source,
  lastSubmittedAt,
  isPinned,
  onTogglePin,
  onSubmitReview,
  onDeleteCustomApp,
  onOpen,
}: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  const handleClick = async () => {
    // 创建实例是“进入工作台”的真正业务动作；
    // LaunchPage 本身不保存实例，只负责发起这个动作。
    if (onOpen) {
      await onOpen(id);
      return;
    }
    await window.api.createInstance(id);
    setActiveAppFilter(id);
    setCurrentPage("workbench");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    void handleClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative flex w-full min-h-[96px] items-center gap-[20px] rounded-[24px] border border-[rgba(148,163,184,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(59,130,246,0.18)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.1)] active:translate-y-0 active:shadow-[0_8px_20px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.35)]"
      style={{
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "18px",
        paddingBottom: "18px",
      }}
      onClick={() => void handleClick()}
      onKeyDown={handleKeyDown}
      title={`打开 ${name}`}
      aria-label={`新建 ${name} 实例`}
    >
      <AppCardActions
        id={id}
        source={source}
        lastSubmittedAt={lastSubmittedAt}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        onSubmitReview={onSubmitReview}
        onDeleteCustomApp={onDeleteCustomApp}
      />
      <AppCardPreview
        name={name}
        icon={icon}
        image={image}
        description={description}
        source={source}
        lastSubmittedAt={lastSubmittedAt}
      />
    </div>
  );
}
