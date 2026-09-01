import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export function ContributeGoalModal({
  open,
  onClose,
  goalTitle,
  onSave,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  goalTitle: string;
  onSave: (amount: number) => void;
  currency: string;
}) {
  const [amount, setAmount] = useState("");

  return (
    <Modal open={open} onClose={onClose} title={`Tambah Tabungan · ${goalTitle}`}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!Number(amount)) return;
          onSave(Number(amount));
          setAmount("");
          onClose();
        }}
      >
        <div>
          <label className="label">Nominal</label>
          <CurrencyInput currency={currency} value={amount} onChange={setAmount} autoFocus />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn-primary">
            Tambahkan
          </button>
        </div>
      </form>
    </Modal>
  );
}
