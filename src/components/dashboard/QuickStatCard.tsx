import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";

export function QuickStatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  changePct,
  isPrivate,
  invertTone = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "negative";
  /** Percent change vs. the comparison period; omitted when there's nothing to compare against. */
  changePct?: number;
  isPrivate?: boolean;
  /** For metrics where going up is bad (e.g. spending) — flips which direction renders green. */
  invertTone?: boolean;
}) {
  const hasChange = changePct !== undefined && Number.isFinite(changePct);
  const isUp = (changePct ?? 0) >= 0;
  const isGood = invertTone ? !isUp : isUp;

  return (
    <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="card p-4 flex flex-col gap-1.5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide truncate">{label}</span>
        {Icon && <Icon size={14} className="text-neutral-300 dark:text-neutral-600 shrink-0" />}
      </div>
      <span
        title={isPrivate ? undefined : value}
        className={clsx(
          "text-base sm:text-lg font-bold tracking-tight font-mono-numbers text-neutral-900 dark:text-neutral-50 truncate block",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-rose-600 dark:text-rose-400"
        )}
      >
        {isPrivate ? "••••••" : value}
      </span>
      {hasChange && !isPrivate && (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(changePct!).toFixed(1)}% vs bulan lalu
        </span>
      )}
    </motion.div>
  );
}
