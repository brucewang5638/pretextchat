interface StatusPillProps {
  message: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  animated?: boolean;
}

const TONE_CLASS: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  neutral: "bg-slate-400 text-slate-400",
  success: "bg-emerald-400 text-emerald-400",
  warning: "bg-amber-400 text-amber-400",
  danger: "bg-rose-400 text-rose-400",
  info: "bg-cyan-400 text-cyan-400",
};

export function StatusPill({
  message,
  tone = "neutral",
  animated = false,
}: StatusPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/5 bg-black/20 px-3 py-[7px] text-[12.5px] font-medium tracking-wide text-[rgba(226,232,240,0.95)] backdrop-blur-sm shadow-inner">
      <span
        className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${TONE_CLASS[tone]} ${animated ? "animate-pulse" : ""}`}
      />
      <span>{message}</span>
    </div>
  );
}

