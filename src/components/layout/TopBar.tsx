import { useLocation } from "react-router-dom";
import { Moon, Sun, Monitor } from "lucide-react";
import { useSettingsStore, applyThemeClass, type ThemePreference } from "@/store/useSettingsStore";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transaksi",
  "/accounts": "Akun",
  "/investments": "Portofolio Investasi",
  "/budgets": "Anggaran",
  "/liabilities": "Utang & Liabilitas",
  "/networth": "Kekayaan Bersih",
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
  const title = TITLES[location.pathname] ?? "Dompetku";

  return (
    <header className="h-16 shrink-0 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        {THEME_OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => {
              setTheme(value);
              applyThemeClass(value);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              theme === value ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-neutral-400"
            }`}
            title={value}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </header>
  );
}
