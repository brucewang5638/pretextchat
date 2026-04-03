interface LaunchEmptyStateProps {
  searchQuery: string;
}

export function LaunchEmptyState({ searchQuery }: LaunchEmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-[rgba(148,163,184,0.32)] bg-white/55 px-6 py-12 text-[var(--color-text-muted)] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      没有找到与 "{searchQuery}" 相关的应用
    </div>
  );
}
