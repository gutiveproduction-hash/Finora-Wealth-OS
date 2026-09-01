import clsx from "clsx";
import { formatCurrency } from "@/lib/format";

export function BudgetProgressBar({
  label,
  spent,
  budget,
  currency,
  color,
}: {
  label: string;
  spent: number;
  budget: number;
  currency: string;
  color: string;
}) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over = budget > 0 && spent > budget;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className={clsx("text-xs", over ? "text-red-600 dark:text-red-400" : "text-neutral-500")}>
          {formatCurrency(spent, currency)} / {formatCurrency(budget, currency)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", over && "!bg-red-500")}
          style={{ width: `${pct}%`, backgroundColor: over ? undefined : color }}
        />
      </div>
    </div>
  );
}
