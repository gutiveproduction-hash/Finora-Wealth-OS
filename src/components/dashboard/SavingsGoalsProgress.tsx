import { motion } from "motion/react";
import { Plus, Target } from "lucide-react";
import type { SavingsGoal } from "@/hooks/useSavingsGoals";
import { formatCompactCurrency } from "@/lib/format";

export function SavingsGoalsProgress({
  goals,
  currency,
  onAddGoal,
  onContribute,
}: {
  goals: SavingsGoal[];
  currency: string;
  onAddGoal: () => void;
  onContribute: (goal: SavingsGoal) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Progres Target</h2>
        <button onClick={onAddGoal} className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white inline-flex items-center gap-1">
          <Plus size={12} /> Tambah
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-2">
          <Target className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
          <p className="text-xs text-neutral-400">Belum ada target tabungan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => {
            const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * idx, duration: 0.3 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1">
                    {goal.title}
                    <button onClick={() => onContribute(goal)} className="text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400" title="Tambah tabungan">
                      <Plus size={11} />
                    </button>
                  </span>
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 font-mono-numbers shrink-0">{Math.round(pct)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, pct)}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 font-mono-numbers">
                  {formatCompactCurrency(goal.currentAmount, currency)} / {formatCompactCurrency(goal.targetAmount, currency)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
