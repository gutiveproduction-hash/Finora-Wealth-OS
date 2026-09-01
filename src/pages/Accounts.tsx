import { useState } from "react";
import { Plus, Wallet, Pencil, Trash2 } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatCurrency } from "@/lib/format";
import { ACCOUNT_TYPE_LABELS } from "@/lib/chartColors";
import { COMMON_CURRENCIES } from "@/lib/currency";
import type { Account, AccountType } from "@/types";

const ACCOUNT_TYPES: AccountType[] = ["bank", "ewallet", "cash", "investment", "other"];

export default function Accounts() {
  const { accounts, loading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "bank" as AccountType,
    currency: "IDR",
    initialBalance: "0",
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", type: "bank", currency: "IDR", initialBalance: "0" });
    setModalOpen(true);
  }

  function openEdit(account: Account) {
    setEditing(account);
    setForm({
      name: account.name,
      type: account.type,
      currency: account.currency,
      initialBalance: String(account.initialBalance),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      type: form.type,
      currency: form.currency,
      initialBalance: Number(form.initialBalance) || 0,
    };
    if (!payload.name) return;
    if (editing) {
      await updateAccount(editing.id, payload);
    } else {
      await createAccount(payload);
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteAccount(pendingDelete.id);
    if (!result.ok) setErrorMsg(result.reason ?? "Gagal menghapus akun");
    setPendingDelete(null);
  }

  const totalByType = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + a.balance;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Kelola rekening bank, e-wallet, tunai, dan akun investasi Anda.
        </p>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm px-4 py-3">
          {errorMsg}
        </div>
      )}

      {!loading && accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Belum ada akun"
          description="Tambahkan akun bank, e-wallet, tunai, atau investasi untuk mulai mencatat transaksi."
          action={
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Tambah Akun Pertama
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">
                    {ACCOUNT_TYPE_LABELS[account.type]}
                  </div>
                  <div className="font-medium">{account.name}</div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost !p-1.5" onClick={() => openEdit(account)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn-ghost !p-1.5 text-red-500" onClick={() => setPendingDelete(account)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-2xl font-semibold">{formatCurrency(account.balance, account.currency)}</div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Ubah Akun" : "Tambah Akun"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Akun</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: BCA, GoPay, Dompet Tunai"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jenis</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ACCOUNT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Mata Uang</label>
              <select
                className="input"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Saldo Awal</label>
            <CurrencyInput
              currency={form.currency}
              value={form.initialBalance}
              onChange={(v) => setForm((f) => ({ ...f, initialBalance: v }))}
            />
            <p className="text-xs text-neutral-400 mt-1">
              Saldo saat ini = saldo awal ± transaksi yang tercatat.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Hapus Akun"
        message={`Yakin ingin menghapus akun "${pendingDelete?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
