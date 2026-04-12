import { IconButton } from "../../../shared/ui/IconButton";
import { PlusIcon } from "../../../shared/ui/icons";

interface NewTabButtonProps {
  appId: string;
  appName: string;
}

export function NewTabButton({ appId, appName }: NewTabButtonProps) {
  return (
    <IconButton
      className="ml-1 h-10 gap-2 whitespace-nowrap rounded-full border border-[color:rgba(148,163,184,0.28)] bg-white/92 px-4 text-sm font-semibold text-[var(--color-text-secondary)] shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:-translate-y-px hover:border-[color:rgba(59,130,246,0.3)] hover:bg-white hover:text-[var(--color-text-primary)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)] [-webkit-app-region:no-drag]"
      onClick={() => window.api.createInstance(appId)}
      title={`新建 ${appName} 实例`}
    >
      <PlusIcon size={14} />
      新建标签页
    </IconButton>
  );
}
