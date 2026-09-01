import { useLocation } from "react-router-dom";
import { Moon, Sun, Monitor, Eye, EyeOff } from "lucide-react";
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
  const isPrivate = useSettingsStore((s) => s.isPrivate);
  const togglePrivacy = useSettingsStore((s) => s.togglePrivacy);
  const title = TITLES[location.pathname] ?? "Finora";

  return (
    <header className="h-16 shrink-0 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-between px-6 bg-[#FBFBFA]/90 dark:bg-[#121316]/90 backdrop-blur-md">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePrivacy}
          title={isPrivate ? "Tampilkan Angka" : "Sembunyikan Angka"}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
        >
          {isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-lg p-1">
          {THEME_OPTIONS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                applyThemeClass(value);
              }}
              className={`p-1.5 rounded-md transition-colors ${
                theme === value
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
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
