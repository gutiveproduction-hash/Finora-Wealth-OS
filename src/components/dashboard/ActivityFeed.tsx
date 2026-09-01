import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import type { Account, Category, Transaction } from "@/types";
import { formatDate } from "@/lib/format";
import { AnimatedNumber } from "@/components/ui/AnimatedCounter";

function activityIcon(type: Transaction["type"]) {
  switch (type) {
    case "income":
      return <ArrowUpRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    case "expense":
      return <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    default:
      return <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  }
}

export function ActivityFeed({
  transactions,
  categoryMap,
  accountMap,
  isPrivate,
}: {
  transactions: Transaction[];
  categoryMap: Map<string, Category>;
  accountMap: Map<string, Account>;
  isPrivate: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="card p-6 relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Aktivitas Terbaru</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Transaksi & pergerakan dana terakhir</p>
        </div>
        <Link to="/transactions" className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline">
          Lihat semua
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 py-8 text-center">Belum ada transaksi.</p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {transactions.map((t, idx) => {
            const category = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
            const account = accountMap.get(t.accountId);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * idx, duration: 0.3 }}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                    {activityIcon(t.type)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {t.note || category?.name || "Transaksi"}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono-numbers">
                      {account?.name} · {formatDate(t.date)}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-bold font-mono-numbers ${
                      t.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : t.type === "expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                    <AnimatedNumber value={t.amount} currency={t.currency} isPrivate={isPrivate} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
