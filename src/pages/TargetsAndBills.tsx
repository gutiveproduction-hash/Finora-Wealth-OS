import { useState } from "react";
import { Plus, Target, Trash2, CalendarClock, Wallet } from "lucide-react";
import { useSavingsGoals, type SavingsGoal } from "@/hooks/useSavingsGoals";
import { useBills, type Bill } from "@/hooks/useBills";
import { useSettingsStore } from "@/store/useSettingsStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GoalFormModal } from "@/components/Modals/GoalFormModal";
import { ContributeGoalModal } from "@/components/Modals/ContributeGoalModal";
import { BillFormModal } from "@/components/Modals/BillFormModal";
import { formatCurrency } from "@/lib/format";

function daysUntil(dueDate: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const today = new Date(new Date().toDateString()).getTime();
  return Math.ceil((due - today) / 86_400_000);
}

export default function TargetsAndBills() {
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const { goals, addGoal, contribute, deleteGoal } = useSavingsGoals();
  const { bills, addBill, markPaid, deleteBill } = useBills();

  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [pendingDeleteGoal, setPendingDeleteGoal] = useState<SavingsGoal | null>(null);
  const [pendingDeleteBill, setPendingDeleteBill] = useState<Bill | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Target Tabungan</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Simpan & pantau progres tujuan finansialmu.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsGoalFormOpen(true)}>
            <Plus size={16} /> Target Baru
          </button>
        </div>

        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Belum ada target tabungan"
            description="Buat target seperti Dana Darurat, Liburan, atau DP Rumah untuk melacak progres menabungmu."
            action={
              <button className="btn-primary" onClick={() => setIsGoalFormOpen(true)}>
                <Plus size={16} /> Target Baru
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
              return (
                <div key={goal.id} className="card p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium truncate">{goal.title}</div>
                    <button className="btn-ghost !p-1.5 text-red-500 shrink-0" onClick={() => setPendingDeleteGoal(goal)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(2, pct)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-numbers text-neutral-500 dark:text-neutral-400">
                      {formatCurrency(goal.currentAmount, baseCurrency)} / {formatCurrency(goal.targetAmount, baseCurrency)}
                    </span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{Math.round(pct)}%</span>
                  </div>
                  <button className="btn-secondary text-xs !py-1.5 self-start" onClick={() => setContributingGoal(goal)}>
                    <Plus size={13} /> Tambah Tabungan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Tagihan</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Reminder tagihan rutin & kartu kredit supaya nggak telat bayar.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsBillFormOpen(true)}>
            <Plus size={16} /> Tagihan Baru
          </button>
        </div>

        {bills.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Belum ada tagihan"
            description="Tambahkan tagihan rutin (listrik, internet, langganan) atau kartu kredit supaya diingatkan sebelum jatuh tempo."
            action={
              <button className="btn-primary" onClick={() => setIsBillFormOpen(true)}>
                <Plus size={16} /> Tagihan Baru
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...bills]
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .map((bill) => {
                const remaining = daysUntil(bill.dueDate);
                return (
                  <div key={bill.id} className="card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-neutral-400">
                          {bill.category === "kartu_kredit" ? "Kartu Kredit & PayLater" : "Tagihan Rutin"}
                        </div>
                        <div className="font-medium truncate">{bill.name}</div>
                      </div>
                      <button className="btn-ghost !p-1.5 text-red-500 shrink-0" onClick={() => setPendingDeleteBill(bill)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono-numbers">
                      {formatCurrency(bill.amount, baseCurrency)}
                    </div>
                    <div className={`text-xs font-semibold ${remaining <= 3 ? "text-amber-600 dark:text-amber-400" : "text-neutral-400"}`}>
                      {remaining < 0 ? "Lewat jatuh tempo" : remaining === 0 ? "Jatuh tempo hari ini" : `${remaining} hari lagi`}
                      {bill.recurring && <span className="text-neutral-400 font-normal"> · berulang tiap bulan</span>}
                    </div>
                    <button className="btn-secondary text-xs !py-1.5 self-start" onClick={() => markPaid(bill.id)}>
                      <Wallet size={13} /> Tandai Lunas
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <GoalFormModal open={isGoalFormOpen} onClose={() => setIsGoalFormOpen(false)} onSave={addGoal} currency={baseCurrency} />
      <ContributeGoalModal
        open={contributingGoal !== null}
        onClose={() => setContributingGoal(null)}
        goalTitle={contributingGoal?.title ?? ""}
        onSave={(amount) => {
          if (contributingGoal) contribute(contributingGoal.id, amount);
        }}
        currency={baseCurrency}
      />
      <BillFormModal open={isBillFormOpen} onClose={() => setIsBillFormOpen(false)} onSave={addBill} currency={baseCurrency} />

      <ConfirmDialog
        open={pendingDeleteGoal !== null}
        title="Hapus Target?"
        message={`Target "${pendingDeleteGoal?.title}" akan dihapus permanen.`}
        onConfirm={() => {
          if (pendingDeleteGoal) deleteGoal(pendingDeleteGoal.id);
          setPendingDeleteGoal(null);
        }}
        onCancel={() => setPendingDeleteGoal(null)}
      />
      <ConfirmDialog
        open={pendingDeleteBill !== null}
        title="Hapus Tagihan?"
        message={`Tagihan "${pendingDeleteBill?.name}" akan dihapus permanen.`}
        onConfirm={() => {
          if (pendingDeleteBill) deleteBill(pendingDeleteBill.id);
          setPendingDeleteBill(null);
        }}
        onCancel={() => setPendingDeleteBill(null)}
      />
    </div>
  );
}
