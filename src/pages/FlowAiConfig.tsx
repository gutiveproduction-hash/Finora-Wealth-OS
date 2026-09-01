import { Sparkles } from "lucide-react";
import { useAiInsightSettings } from "@/hooks/useAiInsightSettings";

export default function FlowAiConfig() {
  const { settings, setSettings } = useAiInsightSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-5 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          FlowAI adalah mesin insight <strong>berbasis aturan yang berjalan lokal</strong> — bukan model AI yang
          memanggil server eksternal. Semua analisisnya dihitung langsung dari data transaksi & target kamu di
          perangkat ini. Pengaturan di halaman ini menentukan ambang batas yang dipakai kartu "AI Insight" di
          Dashboard.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Aktifkan AI Insight</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Tampilkan kartu insight di Dashboard.</div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${settings.enabled ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div>
          <label className="label">Target Rasio Tabungan Sehat (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            className="input"
            value={settings.healthySavingsRate}
            onChange={(e) => setSettings({ ...settings, healthySavingsRate: Number(e.target.value) || 0 })}
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Kalau rasio tabungan bulan ini ≥ angka ini, insight akan bilang "pertahankan!" — kalau di bawahnya, akan
            disarankan untuk mengurangi pengeluaran.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Insight kategori pengeluaran terbesar</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Sebutkan kategori pengeluaran terbesar bulan ini.</div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, showTopExpenseInsight: !settings.showTopExpenseInsight })}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${settings.showTopExpenseInsight ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.showTopExpenseInsight ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Insight fokus target tabungan</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Sorot target tabungan dengan progres paling rendah.</div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, showGoalFocusInsight: !settings.showGoalFocusInsight })}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${settings.showGoalFocusInsight ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.showGoalFocusInsight ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
