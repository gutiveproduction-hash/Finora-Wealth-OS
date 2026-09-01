import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Account, Category, CsvColumnMapping } from "@/types";

type Step = "pick" | "map" | "result";

export function ImportCsvModal({
  open,
  onClose,
  accounts,
  categories,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onImported: () => void;
}) {
  const [step, setStep] = useState<Step>("pick");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [mapping, setMapping] = useState<CsvColumnMapping>({ date: "", amount: "", note: "", signedAmount: true });
  const [dayFirst, setDayFirst] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setStep("pick");
    setFilePath(null);
    setHeaders([]);
    setPreview([]);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePickFile() {
    const path = await window.api.importCsv.chooseFile();
    if (!path) return;
    setBusy(true);
    const data = await window.api.importCsv.preview(path);
    setFilePath(path);
    setHeaders(data.headers);
    setPreview(data.rows);
    setTotalRows(data.totalRows);
    setMapping((m) => ({
      ...m,
      date: data.headers.find((h) => /date|tanggal/i.test(h)) ?? data.headers[0] ?? "",
      amount: data.headers.find((h) => /amount|jumlah|nominal/i.test(h)) ?? data.headers[1] ?? "",
      note: data.headers.find((h) => /note|desc|keterangan|memo/i.test(h)) ?? "",
    }));
    setBusy(false);
    setStep("map");
  }

  async function handleCommit() {
    if (!filePath || !accountId || !mapping.date || !mapping.amount) return;
    setBusy(true);
    const res = await window.api.importCsv.commit({
      filePath,
      accountId,
      categoryId: categoryId || null,
      mapping,
      dayFirst,
    });
    setResult(res);
    setBusy(false);
    setStep("result");
    onImported();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Impor Transaksi dari CSV" width="max-w-2xl">
      {step === "pick" && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">
            Impor mutasi rekening atau riwayat transaksi dari file CSV (misalnya hasil ekspor internet banking atau
            spreadsheet). Anda akan memetakan kolom pada langkah berikutnya.
          </p>
          <button className="btn-primary" onClick={handlePickFile} disabled={busy}>
            {busy ? "Membaca file..." : "Pilih File CSV"}
          </button>
        </div>
      )}

      {step === "map" && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            {filePath} · {totalRows} baris terdeteksi
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Impor ke Akun</label>
              <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Pilih akun...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kategori Default (opsional)</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Tanpa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kolom Tanggal</label>
              <select className="input" value={mapping.date} onChange={(e) => setMapping((m) => ({ ...m, date: e.target.value }))}>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kolom Jumlah</label>
              <select
                className="input"
                value={mapping.amount}
                onChange={(e) => setMapping((m) => ({ ...m, amount: e.target.value }))}
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kolom Catatan (opsional)</label>
              <select
                className="input"
                value={mapping.note}
                onChange={(e) => setMapping((m) => ({ ...m, note: e.target.value }))}
              >
                <option value="">Tidak ada</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!mapping.signedAmount}
                  onChange={(e) => setMapping((m) => ({ ...m, signedAmount: e.target.checked }))}
                />
                Jumlah negatif = pengeluaran
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={dayFirst} onChange={(e) => setDayFirst(e.target.checked)} />
                Format tanggal DD/MM/YYYY
              </label>
            </div>
          </div>

          <div>
            <label className="label">Pratinjau (5 baris pertama)</label>
            <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="text-left px-2 py-1.5 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-neutral-100 dark:border-neutral-800">
                      {headers.map((h) => (
                        <td key={h} className="px-2 py-1.5 whitespace-nowrap">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setStep("pick")}>
              Kembali
            </button>
            <button className="btn-primary" onClick={handleCommit} disabled={busy || !accountId}>
              {busy ? "Mengimpor..." : "Impor Sekarang"}
            </button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-4 py-3 text-sm">
            {result.imported} transaksi berhasil diimpor, {result.skipped} baris dilewati.
          </div>
          {result.errors.length > 0 && (
            <div className="text-xs text-neutral-500 space-y-1 max-h-40 overflow-y-auto">
              {result.errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <button className="btn-primary" onClick={handleClose}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
