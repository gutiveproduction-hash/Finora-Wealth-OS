import { motion } from "motion/react";
import { Clock, Percent, Zap, TrendingUp } from "lucide-react";
import { AnimatedNumber, AnimatedRawNumber, AnimatedPercent } from "@/components/ui/AnimatedCounter";

const cardVariants = {
  initial: { opacity: 0, y: 14 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function HealthMetricsGrid({
  liquidCash,
  monthlyExpenseEstimate,
  debtRatio,
  liquidMarketTotal,
  totalAssets,
  investmentGainPct,
  currency,
  isPrivate,
}: {
  liquidCash: number;
  monthlyExpenseEstimate: number;
  debtRatio: number;
  liquidMarketTotal: number;
  totalAssets: number;
  investmentGainPct: number;
  currency: string;
  isPrivate: boolean;
}) {
  const emergencyRunwayMonths = monthlyExpenseEstimate > 0 ? liquidCash / monthlyExpenseEstimate : 0;
  const liquidityRatio = totalAssets > 0 ? (liquidMarketTotal / totalAssets) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div variants={cardVariants} initial="initial" animate="animate" custom={0} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="card p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Dana Darurat</span>
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono-numbers">
          <AnimatedRawNumber value={emergencyRunwayMonths} decimals={1} /> <span className="text-xs font-semibold text-neutral-500">bulan</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
          <motion.div className="h-full bg-teal-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (emergencyRunwayMonths / 12) * 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
          <AnimatedNumber value={liquidCash} currency={currency} isPrivate={isPrivate} compact /> kas likuid
        </p>
      </motion.div>

      <motion.div variants={cardVariants} initial="initial" animate="animate" custom={1} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="card p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Rasio Hutang / Aset</span>
          <div className={`p-1.5 rounded-lg ${debtRatio < 35 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" : "bg-amber-50 dark:bg-amber-950/40 text-amber-500"} group-hover:scale-110 transition-transform`}>
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono-numbers">
          <AnimatedPercent value={debtRatio} includeSign={false} />
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
          <motion.div className={`h-full rounded-full ${debtRatio < 35 ? "bg-emerald-500" : "bg-amber-500"}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, debtRatio)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
          {debtRatio < 30 ? "✓ Rasio sangat aman (<30%)" : "Rasio dalam batas normal"}
        </p>
      </motion.div>

      <motion.div variants={cardVariants} initial="initial" animate="animate" custom={2} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="card p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Aset Likuid & Pasar</span>
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono-numbers">
          <AnimatedPercent value={liquidityRatio} includeSign={false} />
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
          <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, liquidityRatio)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
          <AnimatedNumber value={liquidMarketTotal} currency={currency} isPrivate={isPrivate} compact /> mudah dicairkan
        </p>
      </motion.div>

      <motion.div variants={cardVariants} initial="initial" animate="animate" custom={3} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="card p-4 sm:p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Imbal Hasil Investasi</span>
          <div className={`p-1.5 rounded-lg ${investmentGainPct >= 0 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" : "bg-rose-50 dark:bg-rose-950/40 text-rose-500"} group-hover:scale-110 transition-transform`}>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`text-xl sm:text-2xl font-bold font-mono-numbers ${investmentGainPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          <AnimatedPercent value={investmentGainPct} />
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${investmentGainPct >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.abs(investmentGainPct) * 3)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">Unrealized gain/loss portofolio</p>
      </motion.div>
    </div>
  );
}
