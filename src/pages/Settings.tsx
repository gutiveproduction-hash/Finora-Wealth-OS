import { useEffect, useState } from "react";
import { Download, Upload, FolderOpen, Plus, Trash2 } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useCategories } from "@/hooks/useCategories";
import { COMMON_CURRENCIES } from "@/lib/currency";
import type { CategoryType } from "@/types";

export default function Settings() {
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const setBaseCurrency = useSettingsStore((s) => s.setBaseCurrency);
  const rates = useSettingsStore((s) => s.rates);
  const refreshRates = useSettingsStore((s) => s.refreshRates);

  const { categories, createCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>("expense");
  const [dbPath, setDbPath] = useState("");
  const [version, setVersion] = useState("");
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  useEffect(() => {
    window.api.backup.dbPath().then(setDbPath);
    window.api.app.getVersion().then(setVersion);
  }, []);

  async function handleRateChange(currency: string, value: string) {
    const rate = Number(value);
    if (Number.isNaN(rate) || rate <= 0) return;
    await window.api.exchangeRates.upsert(currency, rate);
    await refreshRates();
  }

  async function handleAddCurrency(currency: string) {
    if (rates.some((r) => r.currency === currency)) return;
    await window.api.exchangeRates.upsert(currency, 1);
    await refreshRates();
  }

  async function handleExport() {
    const result = await window.api.backup.exportJson();
    setBackupMsg(result.ok ? `Data berhasil diekspor ke ${result.filePath}` : null);
  }

  async function handleImport() {
    const result = await window.api.backup.importJson();
    if (result.ok) {
      setBackupMsg("Data berhasil diimpor. Memuat ulang...");
      setTimeout(() => window.location.reload(), 800);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    await createCategory({ name: newCategoryName.trim(), type: newCategoryType });
    setNewCategoryName("");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="card p-5 space-y-4">
        <h2 className="font-medium">Mata Uang</h2>
        <div>
          <label className="label">Mata Uang Utama (untuk laporan gabungan)</label>
          <select className="input max-w-xs" value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Kurs Konversi (1 unit mata uang = X {baseCurrency})</label>
          <p className="text-xs text-neutral-400 mb-2">
            Aplikasi ini sepenuhnya offline sehingga kurs tidak diperbarui otomatis — masukkan kurs terbaru secara
            manual sesuai kebutuhan Anda.
          </p>
          <div className="space-y-2">
            {rates.map((r) => (
              <div key={r.currency} className="flex items-center gap-2">
                <span className="w-14 text-sm font-medium">{r.currency}</span>
                <input
                  className="input !w-40"
                  type="number"
                  step="any"
                  defaultValue={r.rateToBase}
                  disabled={r.currency === baseCurrency}
                  onBlur={(e) => handleRateChange(r.currency, e.target.value)}
                />
                {r.currency !== baseCurrency && r.currency !== "IDR" && (
                  <button
                    className="btn-ghost !p-1.5 text-red-500"
                    onClick={async () => {
                      await window.api.exchangeRates.delete(r.currency);
                      await refreshRates();
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <select className="input !w-40" id="add-currency-select">
              {COMMON_CURRENCIES.filter((c) => !rates.some((r) => r.currency === c)).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              className="btn-secondary text-sm"
              onClick={() => {
                const select = document.getElementById("add-currency-select") as HTMLSelectElement | null;
                if (select?.value) handleAddCurrency(select.value);
              }}
            >
              <Plus size={14} /> Tambah Mata Uang
            </button>
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-medium">Kategori</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-emerald-600 mb-2">Pemasukan</h3>
            <ul className="space-y-1">
              {categories
                .filter((c) => c.type === "income")
                .map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <button className="text-neutral-400 hover:text-red-500" onClick={() => deleteCategory(c.id)}>
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-2">Pengeluaran</h3>
            <ul className="space-y-1">
              {categories
                .filter((c) => c.type === "expense")
                .map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <button className="text-neutral-400 hover:text-red-500" onClick={() => deleteCategory(c.id)}>
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <input
            className="input"
            placeholder="Nama kategori baru"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <select className="input !w-40" value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value as CategoryType)}>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
          <button className="btn-primary shrink-0" onClick={handleAddCategory}>
            <Plus size={14} /> Tambah
          </button>
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-medium">Data & Cadangan (Backup)</h2>
        <p className="text-xs text-neutral-400">
          Semua data tersimpan secara lokal di komputer Anda dalam file SQLite — tidak ada server, tidak ada akun,
          tidak ada telemetri. Ekspor data secara berkala sebagai cadangan.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} /> Ekspor Data (JSON)
          </button>
          <button className="btn-secondary" onClick={handleImport}>
            <Upload size={16} /> Impor Data (JSON)
          </button>
          <button className="btn-ghost" onClick={() => window.api.backup.revealDbFile()}>
            <FolderOpen size={16} /> Buka Lokasi File Database
          </button>
        </div>
        {backupMsg && <p className="text-xs text-emerald-600">{backupMsg}</p>}
        <p className="text-xs text-neutral-400 break-all">Lokasi database: {dbPath}</p>
      </section>

      <section className="card p-5 space-y-2 text-sm text-neutral-500">
        <h2 className="font-medium text-neutral-700 dark:text-neutral-200">Tentang Finora</h2>
        <p>Versi {version || "-"}</p>
        <p>
          Finora adalah aplikasi pelacak keuangan pribadi &amp; portofolio investasi yang open source (lisensi MIT),
          dibuat untuk berjalan sepenuhnya offline di komputer Anda.
        </p>
      </section>
    </div>
  );
}
