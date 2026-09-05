import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Upload, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImportCsvModal } from "@/components/ImportCsvModal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatCurrency, formatDate, formatNumber, todayIso } from "@/lib/format";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { Transaction, TransactionType } from "@/types";

const emptyForm = {
  accountId: "",
  categoryId: "",
  type: "expense" as TransactionType,
  transferAccountId: "",
  amount: "",
  /** Jumlah yang diterima akun tujuan, hanya dipakai untuk transfer lintas mata uang. */
  transferAmount: "",
  date: todayIso(),
  note: "",
};

export default function Transactions() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const ratesMap = useSettingsStore((s) => s.ratesMap);

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);
  /** Sekali pengguna mengetik jumlah diterima sendiri, berhenti menimpanya dengan hasil konversi. */
  const [transferAmountTouched, setTransferAmountTouched] = useState(false);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const relevantCategories = categories.filter((c) => c.type === (form.type === "income" ? "income" : "expense"));

  const sourceCurrency = accountMap.get(form.accountId)?.currency ?? "IDR";
  const destinationCurrency = accountMap.get(form.transferAccountId)?.currency ?? sourceCurrency;
  const isCrossCurrencyTransfer = form.type === "transfer" && sourceCurrency !== destinationCurrency;

  /** Konversi berdasarkan kurs yang berlaku SEKARANG, dipakai sebagai nilai awal saja —
   * angkanya bisa diubah manual agar sesuai kurs hari transaksi itu, lalu dikunci di
   * transaksi supaya saldo historis tidak berubah saat kurs di Pengaturan diperbarui. */
  function convertAtCurrentRate(amount: number): number {
    const from = ratesMap[sourceCurrency] ?? 1;
    const to = ratesMap[destinationCurrency] ?? 1;
    if (!to) return amount;
    return (amount * from) / to;
  }

  // Isi otomatis jumlah diterima dari kurs saat ini setiap kali nominal / akun tujuan
  // berubah, selama pengguna belum mengetiknya sendiri.
  useEffect(() => {
    if (!isCrossCurrencyTransfer || transferAmountTouched) return;
    const source = Number(form.amount);
    if (!source) return;
    const converted = convertAtCurrentRate(source);
    const rounded = destinationCurrency === "IDR" || destinationCurrency === "JPY" ? Math.round(converted) : Number(converted.toFixed(2));
    setForm((f) => (f.transferAmount === String(rounded) ? f : { ...f, transferAmount: String(rounded) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.amount, form.accountId, form.transferAccountId, isCrossCurrencyTransfer, transferAmountTouched]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, accountId: accounts[0]?.id ?? "" });
    setTransferAmountTouched(false);
    setModalOpen(true);
  }

  // "Tambah Transaksi" in the sidebar navigates here with { openCreate: true } state
  // to open the create form immediately instead of just showing the list.
  useEffect(() => {
    if ((location.state as { openCreate?: boolean } | null)?.openCreate) {
      openCreate();
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setForm({
      accountId: tx.accountId,
      categoryId: tx.categoryId ?? "",
      type: tx.type,
      transferAccountId: tx.transferAccountId ?? "",
      amount: String(tx.amount),
      transferAmount: tx.transferAmount != null ? String(tx.transferAmount) : "",
      date: tx.date.slice(0, 10),
      note: tx.note,
    });
    setTransferAmountTouched(tx.transferAmount != null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      accountId: form.accountId,
      categoryId: form.type === "transfer" ? null : form.categoryId || null,
      type: form.type,
      transferAccountId: form.type === "transfer" ? form.transferAccountId || null : null,
      transferAmount: isCrossCurrencyTransfer ? Number(form.transferAmount) || 0 : null,
      amount: Number(form.amount) || 0,
      date: form.date,
      note: form.note,
    };
    if (!payload.accountId || payload.amount <= 0) return;
    if (isCrossCurrencyTransfer && (payload.transferAmount ?? 0) <= 0) return;
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
                      {/* Transfer lintas mata uang: tampilkan juga jumlah yang diterima. */}
                      {t.transferAmount != null && transferAccount && (
                        <div className="text-xs font-normal text-neutral-400">
                          → {formatCurrency(t.transferAmount, transferAccount.currency)}
                        </div>
                      )}
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
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80">
            {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={form.type === t}
                // Ganti jenis transaksi mengganti daftar kategori yang relevan, jadi kategori
                // lama harus dikosongkan agar tidak tersimpan kategori dari jenis yang salah.
                onClick={() => setForm((f) => (f.type === t ? f : { ...f, type: t, categoryId: "" }))}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  form.type === t
                    ? "bg-white dark:bg-neutral-800 text-brand-600 dark:text-brand-400 shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
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
              <label className="label">{isCrossCurrencyTransfer ? `Jumlah Dikirim (${sourceCurrency})` : "Jumlah"}</label>
              <CurrencyInput
                currency={sourceCurrency}
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

          {isCrossCurrencyTransfer && (
            <div>
              <label className="label">Jumlah Diterima ({destinationCurrency})</label>
              <CurrencyInput
                currency={destinationCurrency}
                value={form.transferAmount}
                onChange={(v) => {
                  setTransferAmountTouched(true);
                  setForm((f) => ({ ...f, transferAmount: v }));
                }}
                required
              />
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-xs text-neutral-400">
                  {Number(form.amount) > 0 && Number(form.transferAmount) > 0
                    ? `Kurs transaksi ini: 1 ${destinationCurrency} = ${formatNumber(
                        Number(form.amount) / Number(form.transferAmount),
                        4
                      )} ${sourceCurrency}. Kurs dikunci di transaksi ini, jadi saldo lama tidak berubah kalau kurs di Pengaturan diperbarui.`
                    : "Isi sesuai jumlah yang benar-benar masuk ke akun tujuan pada tanggal transaksi."}
                </p>
                {transferAmountTouched && (
                  <button
                    type="button"
                    className="btn-ghost text-xs shrink-0 !py-1"
                    onClick={() => setTransferAmountTouched(false)}
                  >
                    Pakai kurs sekarang
                  </button>
                )}
              </div>
            </div>
          )}

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
