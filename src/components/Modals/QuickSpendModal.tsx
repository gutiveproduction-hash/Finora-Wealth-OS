import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { todayIso } from "@/lib/format";
import type { Account, Category } from "@/types";

export function QuickSpendModal({
  open,
  onClose,
  accounts,
  categories,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onSave: (input: { accountId: string; categoryId: string | null; amount: number; note: string; date: string }) => void;
}) {
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const currency = accounts.find((a) => a.id === accountId)?.currency ?? "IDR";

  function reset() {
    setAmount("");
    setNote("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Catat Pengeluaran Cepat">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!accountId || !Number(amount)) return;
          onSave({ accountId, categoryId: categoryId || null, amount: Number(amount), note: note.trim(), date: todayIso() });
          reset();
          onClose();
        }}
      >
        <div>
          <label className="label">Nominal</label>
          <CurrencyInput currency={currency} value={amount} onChange={setAmount} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Akun</label>
            <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Kategori</label>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Catatan (opsional)</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. Makan siang" />
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
