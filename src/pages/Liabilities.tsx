import { useState } from "react";
import { Plus, Landmark, Pencil, Trash2 } from "lucide-react";
import { useLiabilities } from "@/hooks/useLiabilities";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatDate } from "@/lib/format";
import { LIABILITY_TYPE_LABELS } from "@/lib/chartColors";
import { COMMON_CURRENCIES } from "@/lib/currency";
import type { Liability, LiabilityType } from "@/types";

const LIABILITY_TYPES: LiabilityType[] = ["loan", "credit_card", "mortgage", "other"];
const emptyForm = { name: "", type: "loan" as LiabilityType, balance: "0", currency: "IDR", interestRate: "0", dueDate: "", notes: "" };

export default function Liabilities() {
  const { liabilities, loading, createLiability, updateLiability, deleteLiability, totalBalance } = useLiabilities();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Liability | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Liability | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(liability: Liability) {
    setEditing(liability);
    setForm({
      name: liability.name,
      type: liability.type,
      balance: String(liability.balance),
      currency: liability.currency,
      interestRate: String(liability.interestRate),
      dueDate: liability.dueDate ?? "",
      notes: liability.notes,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      type: form.type,
      balance: Number(form.balance) || 0,
      currency: form.currency,
      interestRate: Number(form.interestRate) || 0,
      dueDate: form.dueDate || null,
      notes: form.notes,
    };
    if (!payload.name) return;
    if (editing) {
      await updateLiability(editing.id, payload);
    } else {
      await createLiability(payload);
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteLiability(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StatCard label="Total Liabilitas (per mata uang aslinya)" value={formatCurrency(totalBalance, "IDR")} />
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tambah Liabilitas
        </button>
      </div>

      {!loading && liabilities.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Belum ada utang tercatat"
          description="Tambahkan pinjaman, kartu kredit, KPR, atau cicilan lain untuk melacak kekayaan bersih secara akurat."
          action={
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Tambah Liabilitas
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liabilities.map((l) => (
            <div key={l.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">{LIABILITY_TYPE_LABELS[l.type]}</div>
                  <div className="font-medium">{l.name}</div>
                  {l.dueDate && <div className="text-xs text-neutral-400">Jatuh tempo: {formatDate(l.dueDate)}</div>}
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost !p-1.5" onClick={() => openEdit(l)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn-ghost !p-1.5 text-red-500" onClick={() => setPendingDelete(l)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-2xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(l.balance, l.currency)}</div>
              {l.interestRate > 0 && <div className="text-xs text-neutral-400">Bunga: {l.interestRate}% / tahun</div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Ubah Liabilitas" : "Tambah Liabilitas"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nama</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jenis</label>
              <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LiabilityType }))}>
                {LIABILITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LIABILITY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Mata Uang</label>
              <select className="input" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sisa Saldo</label>
              <input className="input" type="number" step="any" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} />
            </div>
            <div>
              <label className="label">Bunga (% / tahun)</label>
              <input className="input" type="number" step="any" value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Jatuh Tempo (opsional)</label>
            <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Catatan</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
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
        title="Hapus Liabilitas"
        message={`Yakin ingin menghapus "${pendingDelete?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
