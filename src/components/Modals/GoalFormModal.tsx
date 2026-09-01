import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export function GoalFormModal({
  open,
  onClose,
  onSave,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, targetAmount: number) => void;
  currency: string;
}) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Target Baru">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !Number(targetAmount)) return;
          onSave(title.trim(), Number(targetAmount));
          setTitle("");
          setTargetAmount("");
          onClose();
        }}
      >
        <div>
          <label className="label">Nama Target</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Dana Darurat" autoFocus />
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
