import { SearchIcon } from "../../../shared/ui/icons";

interface LaunchSearchBarProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function LaunchSearchBar({
  value,
  placeholder,
  onChange,
}: LaunchSearchBarProps) {
  return (
    <div
      className="flex items-center rounded-[32px] border border-[rgba(148,163,184,0.22)] bg-white/92 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-200 focus-within:border-[rgba(59,130,246,0.3)] focus-within:bg-white focus-within:shadow-[0_14px_36px_rgba(59,130,246,0.12)]"
      style={{ padding: "8px 32px" }}
    >
      <SearchIcon
        size={28}
        className="shrink-0 text-[var(--color-text-muted)] transition-colors duration-200"
        style={{ marginRight: "8px" }}
      />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent px-4 py-2 text-[18px] font-medium text-[var(--color-text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--color-text-muted)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
