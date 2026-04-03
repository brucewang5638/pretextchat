import { useUIStore } from '../../store';
import { AppIcon } from '../AppIcon/AppIcon';
import { PretextBlock } from '../PretextBlock/PretextBlock';
import { resolveAssetPath } from '../../lib/assets';

interface AppCardProps {
  id: string;
  name: string;
  icon: string;
  image?: string;
  category?: string;
  description?: string;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
}

export function AppCard({ id, name, icon, image, description, isPinned, onTogglePin }: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);
  
  const handleClick = async () => {
    await window.api.createInstance(id);
    setActiveAppFilter(id);
    setCurrentPage('workbench');
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePin) onTogglePin(id);
  };

  return (
    <button
      className="group relative flex w-full items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-left shadow-[var(--shadow-sm)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] active:translate-y-0 active:shadow-[var(--shadow-md)]"
      onClick={handleClick}
      title={`打开 ${name}`}
      aria-label={`新建 ${name} 实例`}
      type="button"
    >
      <div
        className={[
          'absolute right-3 top-3 z-10 flex items-center justify-center rounded-md p-1 text-[var(--color-text-tertiary)] transition-all duration-200',
          isPinned ? 'opacity-100 text-[var(--color-accent)]' : 'opacity-0 group-hover:opacity-100',
          'hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
        ].join(' ')}
        onClick={handlePinClick}
        title={isPinned ? "取消固定" : "固定到侧边栏"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isPinned ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 1 0 2.828 2.828l13.348-13.348Z"/>
          <path d="m3.9 3.9 9.9 9.9"/>
          <path d="m15 5 4 4"/>
          <path d="m10.5 9.5-6.5 2"/>
          <path d="m14.5 13.5 2-6.5"/>
          <path d="m2 22 5-5"/>
        </svg>
      </div>
      
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-primary)]">
        {image ? (
          <img src={resolveAssetPath(image)} alt={name} className="h-full w-full rounded-[var(--radius-sm)] object-contain" />
        ) : (
          <AppIcon name={name} icon={icon} size="lg" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{name}</span>
        <PretextBlock
          text={description || '强大的 AI 助手'}
          className="mt-0.5 text-[var(--color-text-muted)]"
          maxLines={2}
          reserveLines={2}
          fontSizePx={12}
          lineHeightPx={17}
          backgroundColor="var(--color-bg-card)"
        />
      </div>
    </button>
  );
}
