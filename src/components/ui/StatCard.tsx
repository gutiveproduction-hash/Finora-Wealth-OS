import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  sub,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "negative";
  sub?: string;
}) {
  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
        <span className="text-xs font-medium">{label}</span>
        {Icon && <Icon size={16} className="text-neutral-400 dark:text-neutral-500" />}
      </div>
      <span
        className={clsx(
          "text-xl sm:text-2xl font-bold tracking-tight font-mono-numbers text-neutral-900 dark:text-neutral-50",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-rose-600 dark:text-rose-400"
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{sub}</span>}
    </div>
  );
}
