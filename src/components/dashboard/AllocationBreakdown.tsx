import { useMemo } from "react";
import { motion } from "motion/react";
import { AnimatedNumber, AnimatedPercent } from "@/components/ui/AnimatedCounter";
import { ALLOCATION_BUCKET_META } from "@/lib/chartColors";

export interface AllocationBucket {
  key: string;
  count: number;
  total: number;
}

export function AllocationBreakdown({
  buckets,
  totalAssets,
  currency,
  isPrivate,
}: {
  buckets: AllocationBucket[];
  totalAssets: number;
  currency: string;
  isPrivate: boolean;
}) {
  const stats = useMemo(() => {
    return buckets
      .filter((b) => b.total > 0)
      .map((b) => ({
        ...b,
        percentage: totalAssets > 0 ? (b.total / totalAssets) * 100 : 0,
        meta: ALLOCATION_BUCKET_META[b.key] ?? ALLOCATION_BUCKET_META.other,
      }))
      .sort((a, b) => b.total - a.total);
  }, [buckets, totalAssets]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="card p-6 relative overflow-hidden">
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Alokasi Portofolio</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Diversifikasi berdasarkan {stats.length} kelas aset aktif
        </p>
      </div>

      {stats.length === 0 ? (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 py-8 text-center">Belum ada data aset.</p>
      ) : (
        <>
          <div className="mt-5 mb-5">
            <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex gap-0.5">
              {stats.map((stat) => (
                <motion.div
                  key={stat.key}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.5, stat.percentage)}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: stat.meta.color }}
                  title={`${stat.meta.label}: ${stat.percentage.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.04, duration: 0.3 }}
                whileHover={{ x: 2 }}
                className="p-2.5 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: stat.meta.color }} />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{stat.meta.label}</div>
                    <div className="text-[11px] text-neutral-400 font-mono-numbers">{stat.count} instrumen</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers">
                    <AnimatedNumber value={stat.total} currency={currency} isPrivate={isPrivate} />
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 font-mono-numbers">
                    <AnimatedPercent value={stat.percentage} includeSign={false} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
