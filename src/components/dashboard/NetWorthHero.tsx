import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, ShieldCheck, Target } from "lucide-react";
import type { NetWorthSnapshot } from "@/types";
import type { FinancialGoal } from "@/hooks/useGoal";
import { AnimatedNumber, AnimatedPercent } from "@/components/ui/AnimatedCounter";

export function NetWorthHero({
  netWorth,
  totalAssets,
  totalLiabilities,
  snapshots,
  currency,
  isPrivate,
  goal,
  onOpenGoal,
}: {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  snapshots: NetWorthSnapshot[];
  currency: string;
  isPrivate: boolean;
  goal: FinancialGoal;
  onOpenGoal: () => void;
}) {
  const prevSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const netWorthChange30d = prevSnapshot && prevSnapshot.netWorth !== 0 ? ((netWorth - prevSnapshot.netWorth) / Math.abs(prevSnapshot.netWorth)) * 100 : null;

  const goalProgress = goal.targetAmount > 0 ? Math.min(100, Math.max(0, (netWorth / goal.targetAmount) * 100)) : 0;
  const assetRatio = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  return (
    <section className="w-full relative">
      {/* Subtle ambient aura */}
      <div className="absolute -top-10 left-1/4 w-96 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 right-1/4 w-80 h-32 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="card p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Top meta & badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Kekayaan Bersih
              </span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <ShieldCheck className="w-3 h-3" />
                {debtRatio < 30 ? "Sangat Sehat" : debtRatio < 60 ? "Cukup Terjaga" : "Perlu Perhatian"}
              </motion.span>
            </div>

            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-mono-numbers">
                <AnimatedNumber value={netWorth} currency={currency} isPrivate={isPrivate} />
              </h1>

              {netWorthChange30d !== null && (
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    netWorthChange30d >= 0
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {netWorthChange30d >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <AnimatedPercent value={netWorthChange30d} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Goal Milestone Widget */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onOpenGoal}
            className="group cursor-pointer p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all sm:max-w-xs w-full shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
                <Target className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-500 transition-colors" />
                <span className="truncate">{goal.title}</span>
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono-numbers">
                <AnimatedPercent value={goalProgress} includeSign={false} />
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neutral-900 to-emerald-700 dark:from-neutral-100 dark:to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono-numbers">
              <AnimatedNumber value={netWorth} currency={currency} isPrivate={isPrivate} compact />
              <span>
                Target: <AnimatedNumber value={goal.targetAmount} currency={currency} isPrivate={isPrivate} compact />
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Split: Assets vs Liabilities Balance */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 transition-all">
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Total Aset</div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers">
                <AnimatedNumber value={totalAssets} currency={currency} isPrivate={isPrivate} />
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                <AnimatedPercent value={assetRatio} includeSign={false} /> kepemilikan bersih
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 transition-all">
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Total Liabilitas</div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers">
                <AnimatedNumber value={totalLiabilities} currency={currency} isPrivate={isPrivate} />
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                Rasio hutang: <AnimatedPercent value={debtRatio} includeSign={false} />
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span>Struktur Portofolio</span>
              <span>Solvabilitas 100%</span>
            </div>

            <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex">
              <motion.div
                className="h-full bg-neutral-900 dark:bg-neutral-100"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(5, 100 - debtRatio)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                title={`Ekuitas Bersih: ${(100 - debtRatio).toFixed(1)}%`}
              />
              <motion.div
                className="h-full bg-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${debtRatio}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                title={`Kewajiban / Hutang: ${debtRatio.toFixed(1)}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                <span>Kekayaan Bersih ({assetRatio.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Hutang ({debtRatio.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
