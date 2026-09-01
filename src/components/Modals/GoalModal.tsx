import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import type { FinancialGoal } from "@/hooks/useGoal";

export function GoalModal({
  open,
  onClose,
  goal,
  onSave,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  goal: FinancialGoal;
  onSave: (goal: FinancialGoal) => void;
  currency: string;
}) {
  const [title, setTitle] = useState(goal.title);
  const [targetAmount, setTargetAmount] = useState(String(goal.targetAmount));

  return (
    <Modal open={open} onClose={onClose} title="Atur Target Kekayaan Bersih">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ title: title.trim() || goal.title, targetAmount: Number(targetAmount) || goal.targetAmount });
          onClose();
        }}
      >
        <div>
          <label className="label">Nama Target</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Dana Pensiun" />
        </div>
        <div>
          <label className="label">Nominal Target</label>
          <CurrencyInput currency={currency} value={targetAmount} onChange={setTargetAmount} />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn-primary">
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
}
