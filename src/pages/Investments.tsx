import { useState } from "react";
import { Plus, TrendingUp, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useInvestments } from "@/hooks/useInvestments";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatNumber, formatPercent, todayIso } from "@/lib/format";
import { ASSET_TYPE_LABELS } from "@/lib/chartColors";
import { COMMON_CURRENCIES } from "@/lib/currency";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toBase } from "@/lib/currency";
import type { Asset, AssetType } from "@/types";

const ASSET_TYPES: AssetType[] = ["stock", "mutual_fund", "crypto", "bond", "property", "other"];

const emptyAssetForm = { name: "", symbol: "", type: "stock" as AssetType, currency: "IDR", currentPrice: "0", notes: "" };
const emptyHoldingForm = {
  accountId: "",
  quantity: "",
  avgBuyPrice: "",
  currency: "IDR",
  recordFundingTransaction: true,
  fundingCategoryId: "",
  date: todayIso(),
};

export default function Investments() {
  const { assets, loading, createAsset, updateAsset, updatePrice, deleteAsset, addHolding, deleteHolding, totals } =
    useInvestments();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const ratesMap = useSettingsStore((s) => s.ratesMap);

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetForm, setAssetForm] = useState(emptyAssetForm);

  const [holdingModalOpen, setHoldingModalOpen] = useState(false);
  const [holdingAsset, setHoldingAsset] = useState<Asset | null>(null);
  const [holdingForm, setHoldingForm] = useState(emptyHoldingForm);

  const [priceModalAsset, setPriceModalAsset] = useState<Asset | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const [pendingDelete, setPendingDelete] = useState<Asset | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalMarketValueBase = assets.reduce((s, a) => s + toBase(a.marketValue, a.currency, ratesMap), 0);
  const totalCostBase = assets.reduce((s, a) => s + toBase(a.totalCost, a.currency, ratesMap), 0);
  const totalGainBase = totalMarketValueBase - totalCostBase;
  const totalGainPct = totalCostBase > 0 ? (totalGainBase / totalCostBase) * 100 : 0;

  function openCreateAsset() {
    setEditingAsset(null);
    setAssetForm(emptyAssetForm);
    setAssetModalOpen(true);
  }

  function openEditAsset(asset: Asset) {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      symbol: asset.symbol,
      type: asset.type,
      currency: asset.currency,
      currentPrice: String(asset.currentPrice),
      notes: asset.notes,
    });
    setAssetModalOpen(true);
  }

  async function handleAssetSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: assetForm.name.trim(),
      symbol: assetForm.symbol.trim(),
      type: assetForm.type,
      currency: assetForm.currency,
      currentPrice: Number(assetForm.currentPrice) || 0,
      notes: assetForm.notes,
    };
    if (!payload.name) return;
    if (editingAsset) {
      await updateAsset(editingAsset.id, payload);
    } else {
      await createAsset(payload);
    }
    setAssetModalOpen(false);
  }

  function openAddHolding(asset: Asset) {
    setHoldingAsset(asset);
    setHoldingForm({ ...emptyHoldingForm, currency: asset.currency, accountId: accounts[0]?.id ?? "" });
    setHoldingModalOpen(true);
  }

  async function handleHoldingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!holdingAsset) return;
    await addHolding({
      assetId: holdingAsset.id,
      accountId: holdingForm.accountId || null,
      quantity: Number(holdingForm.quantity) || 0,
      avgBuyPrice: Number(holdingForm.avgBuyPrice) || 0,
      currency: holdingForm.currency,
      recordFundingTransaction: holdingForm.recordFundingTransaction,
      fundingCategoryId: holdingForm.fundingCategoryId || null,
      date: holdingForm.date,
    });
    setHoldingModalOpen(false);
  }

  async function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceModalAsset) return;
    await updatePrice(priceModalAsset.id, Number(priceInput) || 0);
    setPriceModalAsset(null);
  }

  async function handleDeleteAsset() {
    if (!pendingDelete) return;
    const result = await deleteAsset(pendingDelete.id);
    if (!result.ok) setErrorMsg(result.reason ?? "Gagal menghapus aset");
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Nilai Pasar" value={formatCurrency(totalMarketValueBase, baseCurrency)} icon={TrendingUp} />
        <StatCard label="Total Modal" value={formatCurrency(totalCostBase, baseCurrency)} />
        <StatCard
          label="Untung / Rugi"
          value={`${formatCurrency(totalGainBase, baseCurrency)} (${formatPercent(totalGainPct)})`}
          tone={totalGainBase >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={openCreateAsset}>
          <Plus size={16} /> Tambah Aset
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm px-4 py-3">
          {errorMsg}
        </div>
      )}

      {!loading && assets.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Belum ada aset investasi"
          description="Tambahkan saham, reksadana, kripto, obligasi, atau properti untuk mulai melacak portofolio."
          action={
            <button className="btn-primary" onClick={openCreateAsset}>
              <Plus size={16} /> Tambah Aset Pertama
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">
                    {ASSET_TYPE_LABELS[asset.type]} {asset.symbol && `· ${asset.symbol}`}
                  </div>
                  <div className="font-medium text-lg">{asset.name}</div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {formatNumber(asset.totalQty, 4)} unit @ {formatCurrency(asset.currentPrice, asset.currency)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">{formatCurrency(asset.marketValue, asset.currency)}</div>
                  <div className={`text-sm ${asset.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(asset.gain, asset.currency)} ({formatPercent(asset.gainPct)})
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  className="btn-secondary text-xs"
                  onClick={() => {
                    setPriceModalAsset(asset);
                    setPriceInput(String(asset.currentPrice));
                  }}
                >
                  <RefreshCw size={13} /> Update Harga
                </button>
                <button className="btn-secondary text-xs" onClick={() => openAddHolding(asset)}>
                  <Plus size={13} /> Tambah Holding
                </button>
                <button className="btn-ghost text-xs" onClick={() => openEditAsset(asset)}>
                  <Pencil size={13} /> Ubah
                </button>
                <button className="btn-ghost text-xs text-red-500" onClick={() => setPendingDelete(asset)}>
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
              {asset.holdings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                  {asset.holdings.map((h) => {
                    const account = accounts.find((a) => a.id === h.accountId);
                    return (
                      <div key={h.id} className="flex items-center justify-between text-xs text-neutral-500">
                        <span>
                          {account?.name ?? "Tanpa akun"} · {formatNumber(h.quantity, 4)} unit @{" "}
                          {formatCurrency(h.avgBuyPrice, h.currency)}
                        </span>
                        <button className="text-red-400 hover:text-red-600" onClick={() => deleteHolding(h.id)}>
                          Hapus
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / edit asset */}
      <Modal open={assetModalOpen} onClose={() => setAssetModalOpen(false)} title={editingAsset ? "Ubah Aset" : "Tambah Aset"}>
        <form onSubmit={handleAssetSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Aset</label>
            <input
              className="input"
              value={assetForm.name}
              onChange={(e) => setAssetForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: BBCA, Bitcoin, Reksadana Sucorinvest"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Simbol / Kode</label>
              <input
                className="input"
                value={assetForm.symbol}
                onChange={(e) => setAssetForm((f) => ({ ...f, symbol: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Jenis</label>
              <select
                className="input"
                value={assetForm.type}
                onChange={(e) => setAssetForm((f) => ({ ...f, type: e.target.value as AssetType }))}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ASSET_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mata Uang</label>
              <select
                className="input"
                value={assetForm.currency}
                onChange={(e) => setAssetForm((f) => ({ ...f, currency: e.target.value }))}
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Harga Saat Ini</label>
              <input
                className="input"
                type="number"
                step="any"
                value={assetForm.currentPrice}
                onChange={(e) => setAssetForm((f) => ({ ...f, currentPrice: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="label">Catatan</label>
            <textarea
              className="input"
              rows={2}
              value={assetForm.notes}
              onChange={(e) => setAssetForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setAssetModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Add holding (a purchase lot) */}
      <Modal
        open={holdingModalOpen}
        onClose={() => setHoldingModalOpen(false)}
        title={`Tambah Holding — ${holdingAsset?.name ?? ""}`}
      >
        <form onSubmit={handleHoldingSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jumlah Unit</label>
              <input
                className="input"
                type="number"
                step="any"
                value={holdingForm.quantity}
                onChange={(e) => setHoldingForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Harga Beli / Unit</label>
              <input
                className="input"
                type="number"
                step="any"
                value={holdingForm.avgBuyPrice}
                onChange={(e) => setHoldingForm((f) => ({ ...f, avgBuyPrice: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Akun Sumber Dana (opsional)</label>
            <select
              className="input"
              value={holdingForm.accountId}
              onChange={(e) => setHoldingForm((f) => ({ ...f, accountId: e.target.value }))}
            >
              <option value="">Tidak dicatat ke akun manapun</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          {holdingForm.accountId && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={holdingForm.recordFundingTransaction}
                  onChange={(e) => setHoldingForm((f) => ({ ...f, recordFundingTransaction: e.target.checked }))}
                />
                Catat juga sebagai pengeluaran di akun tersebut
              </label>
              {holdingForm.recordFundingTransaction && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Kategori Pengeluaran</label>
                    <select
                      className="input"
                      value={holdingForm.fundingCategoryId}
                      onChange={(e) => setHoldingForm((f) => ({ ...f, fundingCategoryId: e.target.value }))}
                    >
                      <option value="">Tanpa kategori</option>
                      {categories
                        .filter((c) => c.type === "expense")
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tanggal</label>
                    <input
                      className="input"
                      type="date"
                      value={holdingForm.date}
                      onChange={(e) => setHoldingForm((f) => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setHoldingModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Update current price */}
      <Modal open={!!priceModalAsset} onClose={() => setPriceModalAsset(null)} title={`Update Harga — ${priceModalAsset?.name ?? ""}`} width="max-w-sm">
        <form onSubmit={handlePriceSubmit} className="space-y-4">
          <div>
            <label className="label">Harga Terbaru</label>
            <input className="input" type="number" step="any" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setPriceModalAsset(null)}>
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
        title="Hapus Aset"
        message={`Yakin ingin menghapus aset "${pendingDelete?.name}"?`}
        onConfirm={handleDeleteAsset}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
