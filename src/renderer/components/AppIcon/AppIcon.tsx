interface AppIconProps {
  name: string;
  icon: string;
  size?: 'sm' | 'md' | 'lg';
}

function getIconLabel(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

function getVariant(icon: string): string {
  const key = icon.replace(/\.svg$/i, '');

  const variants: Record<string, string> = {
    chatgpt: 'bg-gradient-to-br from-[#10a37f] to-[#0f766e]',
    claude: 'bg-gradient-to-br from-amber-600 to-amber-800',
    gemini: 'bg-gradient-to-br from-blue-600 to-violet-600',
    perplexity: 'bg-gradient-to-br from-cyan-600 to-cyan-950',
    deepseek: 'bg-gradient-to-br from-blue-600 to-blue-950',
  };

  return variants[key] ?? 'bg-gradient-to-br from-slate-600 to-slate-950';
}

function getSize(size: NonNullable<AppIconProps['size']>): string {
  const sizes: Record<NonNullable<AppIconProps['size']>, string> = {
    sm: 'h-5 w-5 rounded-md text-[10px]',
    md: 'h-12 w-12 rounded-xl text-[18px]',
    lg: 'h-14 w-14 rounded-xl text-[20px]',
  };

  return sizes[size];
}

export function AppIcon({ name, icon, size = 'md' }: AppIconProps) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        getSize(size),
        getVariant(icon),
      ].join(' ')}
      aria-hidden="true"
      title={name}
    >
      {getIconLabel(name)}
    </span>
  );
}
