import { resolveAssetPath } from "../../../../shared/asset-path";
import { AppIcon } from "../../../../shared/ui/AppIcon/AppIcon";

interface AppCardPreviewProps {
  name: string;
  icon: string;
  image?: string;
  description?: string;
  source?: "builtin" | "custom";
  lastSubmittedAt?: number;
}

export function AppCardPreview({
  name,
  icon,
  image,
  description,
  source,
  lastSubmittedAt,
}: AppCardPreviewProps) {
  return (
    <>
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] border border-[rgba(148,163,184,0.1)] bg-[#f8fafc] p-[8px] shadow-[0_2px_8px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">
        {image ? (
          <img
            src={resolveAssetPath(image)}
            alt={name}
            className="h-full w-full rounded-[6px] object-contain drop-shadow-sm"
          />
        ) : (
          <AppIcon name={name} icon={icon} size="md" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-start gap-1.5 self-stretch pr-6 pt-0.5">
        <span className="truncate text-[15px] font-bold leading-[1.2] text-[var(--color-text-primary)]">
          {name}
        </span>

        {source === "custom" && (
          <span className="inline-flex w-fit rounded-full bg-[rgba(59,130,246,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-accent)]">
            {lastSubmittedAt ? "已提交审核" : "自定义"}
          </span>
        )}

        <p
          className="overflow-hidden text-[12px] leading-[17px] text-[var(--color-text-muted)]"
          style={{
            minHeight: "34px",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
          title={description || "强大的 AI 助手"}
        >
          {description || "强大的 AI 助手"}
        </p>
      </div>
    </>
  );
}
