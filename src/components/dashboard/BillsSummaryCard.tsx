import { motion } from "motion/react";
import type { Bill } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/format";

export function BillsSummaryCard({ bills, currency }: { bills: Bill[]; currency: string }) {
  const kartuKredit = bills.filter((b) => b.category === "kartu_kredit").reduce((s, b) => s + b.amount, 0);
  const rutin = bills.filter((b) => b.category === "rutin").reduce((s, b) => s + b.amount, 0);
  const kartuKreditCount = bills.filter((b) => b.category === "kartu_kredit").length;
  const rutinCount = bills.filter((b) => b.category === "rutin").length;
  const total = kartuKredit + rutin;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="card p-5 h-full flex flex-col">
      <div className="pb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total Tagihan</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Semua tagihan pending</p>
      </div>
      <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono-numbers mb-4">{formatCurrency(total, currency)}</div>

      <div className="space-y-3 mt-auto">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Kartu Kredit & PayLater {kartuKreditCount > 0 && <span className="text-neutral-400">({kartuKreditCount} tagihan)</span>}
            </span>
            <span className="font-mono-numbers font-semibold text-neutral-800 dark:text-neutral-100">{formatCurrency(kartuKredit, currency)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${total > 0 ? (kartuKredit / total) * 100 : 0}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Tagihan Rutin {rutinCount > 0 && <span className="text-neutral-400">({rutinCount} tagihan)</span>}
            </span>
            <span className="font-mono-numbers font-semibold text-neutral-800 dark:text-neutral-100">{formatCurrency(rutin, currency)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${total > 0 ? (rutin / total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
