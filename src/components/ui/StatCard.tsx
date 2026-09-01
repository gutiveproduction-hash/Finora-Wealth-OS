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
    <div className="card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">{label}</span>
        {Icon && <Icon size={18} className="text-neutral-400" />}
      </div>
      <span
        className={clsx(
          "text-2xl font-semibold tracking-tight",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-red-600 dark:text-red-400"
        )}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-neutral-400">{sub}</span>}
    </div>
  );
}
