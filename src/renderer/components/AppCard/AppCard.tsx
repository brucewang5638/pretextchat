// ============================================================
// AppCard — 启动页上的应用入口卡片
// ============================================================
// 这张卡片的核心职责很简单：
// 点击后直接创建实例，并把 UI 切到工作台。

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
    // 创建实例是“进入工作台”的真正业务动作；
    // LaunchPage 本身不保存实例，只负责发起这个动作。
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
      className="group relative flex w-full min-h-[96px] items-center gap-[20px] rounded-[24px] border border-[rgba(148,163,184,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(59,130,246,0.18)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.1)] active:translate-y-0 active:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
      style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '18px', paddingBottom: '18px' }}
      onClick={handleClick}
      title={`打开 ${name}`}
      aria-label={`新建 ${name} 实例`}
      type="button"
    >
      <div
        className={[
          'absolute right-4 top-4 z-10 flex items-center justify-center rounded-md p-1.5 text-[var(--color-text-tertiary)] transition-all duration-200',
          isPinned ? 'opacity-100 text-[var(--color-accent)]' : 'opacity-0 group-hover:opacity-100',
          'hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
        ].join(' ')}
        onClick={handlePinClick}
        title={isPinned ? "取消固定" : "固定到侧边栏"}
      >
        {/* 固定按钮通过 stopPropagation 阻止触发整卡打开逻辑。 */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isPinned ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          <path d="M12 17v5" />
        </svg>
      </div>
      
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[#f8fafc] p-[8px] shadow-[0_2px_8px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[rgba(148,163,184,0.1)]">
        {image ? (
          <img src={resolveAssetPath(image)} alt={name} className="h-full w-full object-contain drop-shadow-sm rounded-[6px]" />
        ) : (
          <AppIcon name={name} icon={icon} size="md" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-start gap-1.5 self-stretch pr-6 pt-0.5">
        <span className="truncate text-[15px] font-bold leading-[1.2] text-[var(--color-text-primary)]">
          {name}
        </span>
        <PretextBlock
          text={description || '强大的 AI 助手'}
          className="text-[var(--color-text-muted)]"
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
