import { motion } from "motion/react";
import { Plus, CalendarClock } from "lucide-react";
import type { Bill } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/format";

function daysUntil(dueDate: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const today = new Date(new Date().toDateString()).getTime();
  return Math.ceil((due - today) / 86_400_000);
}

export function UpcomingBills({
  bills,
  currency,
  onMarkPaid,
  onAdd,
}: {
  bills: Bill[];
  currency: string;
  onMarkPaid: (id: string) => void;
  onAdd: () => void;
}) {
  const sorted = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Tagihan Mendatang</h2>
        <button onClick={onAdd} className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white inline-flex items-center gap-1">
          <Plus size={12} /> Tambah
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-2">
          <CalendarClock className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
          <p className="text-xs text-neutral-400">Belum ada tagihan</p>
        </div>
      ) : (
        <div className="space-y-1 -mx-2">
          {sorted.map((bill, idx) => {
            const remaining = daysUntil(bill.dueDate);
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * idx, duration: 0.3 }}
                className="px-2 py-2 rounded-xl flex items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{bill.name}</div>
                  <div className="text-[11px] font-mono-numbers text-neutral-500 dark:text-neutral-400">{formatCurrency(bill.amount, currency)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[11px] font-semibold mb-1 ${remaining <= 3 ? "text-amber-600 dark:text-amber-400" : "text-neutral-400"}`}>
                    {remaining < 0 ? "Lewat jatuh tempo" : remaining === 0 ? "Hari ini" : `${remaining} hari lagi`}
                  </div>
                  <button onClick={() => onMarkPaid(bill.id)} className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Bayar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
