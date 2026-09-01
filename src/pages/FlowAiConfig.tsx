import { Sparkles } from "lucide-react";
import { useAiInsightSettings } from "@/hooks/useAiInsightSettings";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Aktifkan AI Insight</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Tampilkan kartu insight di Dashboard.</div>
          </div>
          <ToggleSwitch checked={settings.enabled} onChange={(v) => setSettings({ ...settings, enabled: v })} />
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

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Insight kategori pengeluaran terbesar</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Sebutkan kategori pengeluaran terbesar bulan ini.</div>
          </div>
          <ToggleSwitch checked={settings.showTopExpenseInsight} onChange={(v) => setSettings({ ...settings, showTopExpenseInsight: v })} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Insight fokus target tabungan</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Sorot target tabungan dengan progres paling rendah.</div>
          </div>
          <ToggleSwitch checked={settings.showGoalFocusInsight} onChange={(v) => setSettings({ ...settings, showGoalFocusInsight: v })} />
        </div>
      </div>
    </div>
  );
}
