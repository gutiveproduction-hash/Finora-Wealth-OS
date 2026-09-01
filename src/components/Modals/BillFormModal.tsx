import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { todayIso } from "@/lib/format";
import type { BillCategory } from "@/hooks/useBills";

export function BillFormModal({
  open,
  onClose,
  onSave,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: { name: string; amount: number; dueDate: string; category: BillCategory; recurring: boolean }) => void;
  currency: string;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [category, setCategory] = useState<BillCategory>("rutin");
  const [recurring, setRecurring] = useState(true);

  function reset() {
    setName("");
    setAmount("");
    setDueDate(todayIso());
    setCategory("rutin");
    setRecurring(true);
  }

  return (
    <Modal open={open} onClose={onClose} title="Tagihan Baru">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !Number(amount) || !dueDate) return;
          onSave({ name: name.trim(), amount: Number(amount), dueDate, category, recurring });
          reset();
          onClose();
        }}
      >
        <div>
          <label className="label">Nama Tagihan</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Listrik & Air" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Nominal</label>
            <CurrencyInput currency={currency} value={amount} onChange={setAmount} />
          </div>
          <div>
            <label className="label">Jatuh Tempo</label>
            <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Kategori</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as BillCategory)}>
              <option value="rutin">Tagihan Rutin</option>
              <option value="kartu_kredit">Kartu Kredit & PayLater</option>
            </select>
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="rounded" />
              Berulang tiap bulan
            </label>
          </div>
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
