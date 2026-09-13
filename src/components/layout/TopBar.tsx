import { useLocation } from "react-router-dom";
import { Moon, Sun, Monitor, Eye, EyeOff, Layers } from "lucide-react";
import { useSettingsStore, applyThemeClass, type ThemePreference } from "@/store/useSettingsStore";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Riwayat Transaksi",
  "/accounts": "Daftar Akun",
  "/investments": "Portofolio Investasi",
  "/budgets": "Budgeting & Prediksi",
  "/liabilities": "Utang & Liabilitas",
  "/networth": "Laporan Keuangan",
  "/targets": "Target & Tagihan",
  "/flowai": "FlowAI Config",
  "/guide": "Panduan",
  "/settings": "Pengaturan",
};

const THEME_OPTIONS: { value: ThemePreference; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "system", icon: Monitor },
  { value: "dark", icon: Moon },
];

export function TopBar() {
  const location = useLocation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isPrivate = useSettingsStore((s) => s.isPrivate);
  const togglePrivacy = useSettingsStore((s) => s.togglePrivacy);
  const title = TITLES[location.pathname] ?? "Finora";
  // On macOS the window uses an inset title bar; the traffic-light buttons are drawn
  // over this header now that the left rail is gone, so keep the title clear of them.
  const isMacElectron = typeof window !== "undefined" && window.api?.platform === "darwin";

  return (
    <header
      className={`icloud-chrome h-14 shrink-0 border-b flex items-center justify-between pr-6 ${
        isMacElectron ? "pl-24" : "pl-6"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="icloud-metal w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-neutral-900 dark:text-white shrink-0">
          Finora
        </span>
        <span className="w-px h-4 bg-neutral-900/15 dark:bg-white/20 shrink-0" />
        <h1 className="text-[15px] font-medium tracking-tight text-neutral-600 dark:text-neutral-300 truncate">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePrivacy}
          title={isPrivate ? "Tampilkan Angka" : "Sembunyikan Angka"}
          className="icloud-topbar-btn w-9 h-9"
        >
          {isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>

        <div className="flex items-center gap-1 rounded-full p-1 bg-white/45 border border-white/70 dark:bg-white/10 dark:border-white/15">
          {THEME_OPTIONS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                applyThemeClass(value);
              }}
              className={`p-1.5 rounded-full transition-colors ${
                theme === value
                  ? "bg-white/85 text-neutral-900 shadow-sm dark:bg-white/25 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-white/60 dark:hover:text-white"
              }`}
              title={value}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
