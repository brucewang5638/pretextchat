import { resolveAssetPath } from "../../../shared/asset-path";
import { IconButton } from "../../../shared/ui/IconButton";
import { BRAND_LOGO_ASSET_PATH } from "../../../../shared/branding";

interface SidebarHomeButtonProps {
  isActive: boolean;
  onClick: () => void | Promise<void>;
}

export function SidebarHomeButton({
  isActive,
  onClick,
}: SidebarHomeButtonProps) {
  return (
    <IconButton
      className={[
        "mb-3 flex h-12 w-12 overflow-hidden rounded-2xl border border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
        isActive ? "bg-[var(--color-bg-active)] text-[var(--color-accent)]" : "",
      ].join(" ")}
      onClick={onClick}
      title="应用主页"
    >
      <img
        src={resolveAssetPath(BRAND_LOGO_ASSET_PATH)}
        alt="PretextChat"
        className="block h-full w-full object-contain p-1"
      />
    </IconButton>
  );
}
