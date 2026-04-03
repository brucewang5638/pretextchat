import type {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "@hello-pangea/dnd";
import type { MouseEvent } from "react";
import type { Application } from "../../../../shared/types";
import { resolveAssetPath } from "../../../shared/asset-path";
import { IconButton } from "../../../shared/ui/IconButton";
import { CloseIcon } from "../../../shared/ui/icons";

interface SidebarAppItemProps {
  app: Application;
  isActive: boolean;
  isDragging: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  draggableProps: DraggableProvidedDraggableProps;
  innerRef: (element: HTMLElement | null) => void;
  onSelect: (appId: string) => void | Promise<void>;
  onClose: (event: MouseEvent<HTMLButtonElement>, appId: string) => void;
}

export function SidebarAppItem({
  app,
  isActive,
  isDragging,
  dragHandleProps,
  draggableProps,
  innerRef,
  onSelect,
  onClose,
}: SidebarAppItemProps) {
  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...(dragHandleProps ?? {})}
      className={[
        "group relative mb-3 flex h-12 w-12 cursor-pointer items-center justify-center select-none",
        isDragging ? "z-50" : "",
      ].join(" ")}
      onClick={() => void onSelect(app.id)}
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
          "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border-2 border-transparent bg-[var(--color-bg-elevated)] text-sm font-bold text-[var(--color-text-secondary)] transition-all duration-200",
          isDragging
            ? "scale-110 rounded-[16px] border-[rgba(148,163,184,0.4)] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.2)]"
            : "group-hover:-translate-y-0.5 group-hover:rounded-[16px] group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
          isActive && !isDragging
            ? "rounded-[16px] border-[var(--color-accent)] bg-white text-[var(--color-accent)] shadow-[0_12px_28px_rgba(59,130,246,0.16)]"
            : "",
        ].join(" ")}
      >
        {app.image ? (
          <img
            src={resolveAssetPath(app.image)}
            alt={app.name}
            className="pointer-events-none h-full w-full object-contain"
          />
        ) : (
          app.name.charAt(0)
        )}
      </div>

      <IconButton
        className="absolute -right-2 -top-2 z-10 hidden h-5 w-5 rounded-full bg-[var(--color-danger)] text-white shadow-md hover:scale-110 group-hover:flex"
        onClick={(event) => onClose(event, app.id)}
        title={`关闭并移除 ${app.name}`}
      >
        <CloseIcon size={12} strokeWidth={3} />
      </IconButton>
    </div>
  );
}
