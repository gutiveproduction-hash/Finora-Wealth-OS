import { useMemo, useState } from "react";
import { Plus, Upload, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImportCsvModal } from "@/components/ImportCsvModal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatCurrency, formatDate, todayIso } from "@/lib/format";
import type { Transaction, TransactionType } from "@/types";

const emptyForm = {
  accountId: "",
  categoryId: "",
  type: "expense" as TransactionType,
  transferAccountId: "",
  amount: "",
  date: todayIso(),
  note: "",
};

export default function Transactions() {
  const [filterAccount, setFilterAccount] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "">("");
  const [search, setSearch] = useState("");

  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction, refresh } = useTransactions({
    accountId: filterAccount || undefined,
    type: filterType || undefined,
    search: search || undefined,
  });
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const relevantCategories = categories.filter((c) => c.type === (form.type === "income" ? "income" : "expense"));

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, accountId: accounts[0]?.id ?? "" });
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setForm({
      accountId: tx.accountId,
      categoryId: tx.categoryId ?? "",
      type: tx.type,
      transferAccountId: tx.transferAccountId ?? "",
      amount: String(tx.amount),
      date: tx.date.slice(0, 10),
      note: tx.note,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      accountId: form.accountId,
      categoryId: form.type === "transfer" ? null : form.categoryId || null,
      type: form.type,
      transferAccountId: form.type === "transfer" ? form.transferAccountId || null : null,
      amount: Number(form.amount) || 0,
      date: form.date,
      note: form.note,
    };
    if (!payload.accountId || payload.amount <= 0) return;
    if (editing) {
      await updateTransaction(editing.id, payload);
    } else {
      await createTransaction(payload);
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <select className="input !w-auto" value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
            <option value="">Semua Akun</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            className="input !w-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | "")}
          >
            <option value="">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </select>
          <input
            className="input !w-52"
            placeholder="Cari catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> Impor CSV
          </button>
          <button className="btn-primary" onClick={openCreate} disabled={accounts.length === 0}>
            <Plus size={16} /> Tambah Transaksi
          </button>
        </div>
      </div>

      {!loading && transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Belum ada transaksi"
          description={
            accounts.length === 0
              ? "Tambahkan akun terlebih dahulu sebelum mencatat transaksi."
              : "Catat pemasukan, pengeluaran, atau transfer antar akun."
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Tanggal</th>
                <th className="text-left px-4 py-2.5 font-medium">Akun</th>
                <th className="text-left px-4 py-2.5 font-medium">Kategori / Catatan</th>
                <th className="text-right px-4 py-2.5 font-medium">Jumlah</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {transactions.map((t) => {
                const account = accountMap.get(t.accountId);
                const category = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
                const transferAccount = t.transferAccountId ? accountMap.get(t.transferAccountId) : undefined;
                return (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-4 py-2.5">
                      {account?.name}
                      {t.type === "transfer" && transferAccount ? ` → ${transferAccount.name}` : ""}
                    </td>
                    <td className="px-4 py-2.5">
                      <div>{category?.name ?? (t.type === "transfer" ? "Transfer" : "-")}</div>
                      {t.note && <div className="text-xs text-neutral-400">{t.note}</div>}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${
                        t.type === "income" ? "text-emerald-600" : t.type === "expense" ? "text-red-600" : ""
                      }`}
                    >
                      {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                      {formatCurrency(t.amount, t.currency)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 justify-end">
                        <button className="btn-ghost !p-1.5" onClick={() => openEdit(t)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn-ghost !p-1.5 text-red-500" onClick={() => setPendingDelete(t)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Ubah Transaksi" : "Tambah Transaksi"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`btn-secondary !bg-transparent border ${
                  form.type === t
                    ? "border-brand-500 text-brand-600 bg-brand-50 dark:bg-brand-950"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {t === "expense" ? "Pengeluaran" : t === "income" ? "Pemasukan" : "Transfer"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{form.type === "transfer" ? "Dari Akun" : "Akun"}</label>
              <select
                className="input"
                value={form.accountId}
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                required
              >
                <option value="">Pilih akun...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            {form.type === "transfer" ? (
              <div>
                <label className="label">Ke Akun</label>
                <select
                  className="input"
                  value={form.transferAccountId}
                  onChange={(e) => setForm((f) => ({ ...f, transferAccountId: e.target.value }))}
                  required
                >
                  <option value="">Pilih akun...</option>
                  {accounts
                    .filter((a) => a.id !== form.accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="label">Kategori</label>
                <select
                  className="input"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">Tanpa kategori</option>
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jumlah</label>
              <CurrencyInput
                currency={accountMap.get(form.accountId)?.currency ?? "IDR"}
                value={form.amount}
                onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
                required
              />
            </div>
            <div>
              <label className="label">Tanggal</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Catatan</label>
            <input className="input" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
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

      <ImportCsvModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        accounts={accounts}
        categories={categories}
        onImported={refresh}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Hapus Transaksi"
        message="Yakin ingin menghapus transaksi ini?"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
