import type { MouseEvent } from "react";
import { IconButton } from "../../../../shared/ui/IconButton";
import { PinIcon, SendIcon, TrashIcon } from "../../../../shared/ui/icons";

interface AppCardActionsProps {
  id: string;
  source?: "builtin" | "custom";
  lastSubmittedAt?: number;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  onSubmitReview?: (id: string) => void;
  onDeleteCustomApp?: (id: string) => void;
}

const ACTION_CLASS =
  "rounded-md p-1.5 text-[var(--color-text-tertiary)] opacity-0 transition-all duration-200 group-hover:opacity-100";

export function AppCardActions({
  id,
  source,
  lastSubmittedAt,
  isPinned,
  onTogglePin,
  onSubmitReview,
  onDeleteCustomApp,
}: AppCardActionsProps) {
  const handleStopPropagation = (
    event: MouseEvent<HTMLButtonElement>,
    handler?: (id: string) => void,
  ) => {
    event.stopPropagation();
    handler?.(id);
  };

  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
      {source === "custom" && (
        <>
          <IconButton
            className={`${ACTION_CLASS} hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]`}
            onClick={(event) => handleStopPropagation(event, onSubmitReview)}
            title={lastSubmittedAt ? "再次提交审核" : "提交到云端审核"}
          >
            <SendIcon size={18} />
          </IconButton>

          <IconButton
            className={`${ACTION_CLASS} hover:bg-[var(--color-bg-tertiary)] hover:text-rose-500`}
            onClick={(event) =>
              handleStopPropagation(event, onDeleteCustomApp)
            }
            title="删除自定义应用"
          >
            <TrashIcon size={18} />
          </IconButton>
        </>
      )}

      {onTogglePin && (
        <IconButton
          className={[
            "rounded-md p-1.5 text-[var(--color-text-tertiary)] transition-all duration-200 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]",
            isPinned
              ? "opacity-100 text-[var(--color-accent)]"
              : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
          onClick={(event) => handleStopPropagation(event, onTogglePin)}
          title={isPinned ? "取消固定" : "固定到侧边栏"}
        >
          <PinIcon size={18} filled={Boolean(isPinned)} />
        </IconButton>
      )}
    </div>
  );
}
