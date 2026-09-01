import { useState } from "react";
import { ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { EmptyState } from "@/components/ui/EmptyState";
import { BudgetProgressBar } from "@/components/charts/BudgetProgressBar";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatCurrency, formatMonthLabel, currentMonth } from "@/lib/format";
import { colorForIndex } from "@/lib/chartColors";
import { useSettingsStore } from "@/store/useSettingsStore";

/** Local-state wrapper so the per-category budget field can use CurrencyInput's
 * controlled value/onChange while still only committing on blur. */
function BudgetAmountInput({ initial, onCommit }: { initial: number | ""; onCommit: (value: number) => void }) {
  const [value, setValue] = useState(initial === "" ? "" : String(initial));

  return (
    <CurrencyInput
      className="input !py-1.5 text-sm"
      currency="IDR"
      placeholder="Anggaran"
      value={value}
      onChange={setValue}
      onBlur={() => onCommit(Number(value) || 0)}
    />
  );
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Budgets() {
  const [month, setMonth] = useState(currentMonth());
  const { budgets, actuals, loading, setBudget, deleteBudget } = useBudgets(month);
  const { categories } = useCategories();
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const budgetMap = new Map(budgets.map((b) => [b.categoryId, b]));

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = Object.values(actuals).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn-ghost !p-2" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium w-40 text-center">{formatMonthLabel(month)}</span>
          <button className="btn-ghost !p-2" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="text-sm text-neutral-500">
          Total: {formatCurrency(totalSpent, baseCurrency)} / {formatCurrency(totalBudget, baseCurrency)}
        </div>
      </div>

      {expenseCategories.length === 0 ? (
        <EmptyState icon={PiggyBank} title="Belum ada kategori pengeluaran" description="Tambahkan kategori terlebih dahulu di halaman Transaksi." />
      ) : (
        <div className="card p-5 space-y-5">
          {expenseCategories.map((c, i) => {
            const budget = budgetMap.get(c.id);
            const spent = actuals[c.id] ?? 0;
            return (
              <div key={c.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <BudgetProgressBar label={c.name} spent={spent} budget={budget?.amount ?? 0} currency={c.type === "expense" ? "IDR" : "IDR"} color={colorForIndex(i)} />
                </div>
                <div className="w-36">
                  <BudgetAmountInput
                    key={`${c.id}-${month}`}
                    initial={budget?.amount ?? ""}
                    onCommit={(value) => {
                      if (value > 0) setBudget(c.id, value);
                      else if (budget) deleteBudget(budget.id);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && (
        <p className="text-xs text-neutral-400">
          Isi kolom anggaran lalu klik di luar untuk menyimpan. Kosongkan (0) untuk menghapus anggaran kategori tersebut.
        </p>
      )}
    </div>
  );
}
