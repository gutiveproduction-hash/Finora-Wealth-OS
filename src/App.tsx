import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { X } from "lucide-react";
import { NavLauncher } from "@/components/layout/NavLauncher";
import { TopBar } from "@/components/layout/TopBar";
import { useSettingsStore, applyThemeClass } from "@/store/useSettingsStore";
import { IS_DEMO_MODE } from "@/lib/mockApi";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Accounts from "@/pages/Accounts";
import Investments from "@/pages/Investments";
import Budgets from "@/pages/Budgets";
import Liabilities from "@/pages/Liabilities";
import NetWorth from "@/pages/NetWorth";
import Settings from "@/pages/Settings";
import TargetsAndBills from "@/pages/TargetsAndBills";
import FlowAiConfig from "@/pages/FlowAiConfig";
import Guide from "@/pages/Guide";
import { SmokeyBackground } from "@/components/ui/smokey-background";

export default function App() {
  const loaded = useSettingsStore((s) => s.loaded);
  const theme = useSettingsStore((s) => s.theme);
  const load = useSettingsStore((s) => s.load);
  const [showDemoBanner, setShowDemoBanner] = useState(IS_DEMO_MODE);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    applyThemeClass(theme);
    setIsDark(document.documentElement.classList.contains("dark"));
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyThemeClass(theme);
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  if (!loaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-neutral-400 text-sm">
        Memuat Finora...
      </div>
    );
  }

  return (
    <div className="icloud-canvas relative h-screen w-screen flex flex-col overflow-hidden">
      {/* The shader writes `u_color * glow`, so wherever the glow falls off it
          renders black — fine over a dark page, but in light mode those bands
          swallow the text. Light keeps the gradient wallpaper. */}
      {isDark && (
        <SmokeyBackground className="fixed inset-0 z-0" backdropBlurAmount="xl" color="#1E40AF" />
      )}
      {showDemoBanner && (
        <div className="relative z-10 shrink-0 bg-amber-500 text-amber-950 text-xs sm:text-sm px-4 py-2 flex items-center justify-between gap-3">
          <span>
            <strong>Mode Pratinjau Browser.</strong> Ini bukan aplikasi sebenarnya — data contoh disimpan di
            localStorage browser ini saja (tidak permanen, tidak sinkron). Jalankan sebagai aplikasi desktop (
            <code>npm run electron:dev</code>) untuk versi lengkap dengan database SQLite lokal &amp; impor CSV.
          </span>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="shrink-0 p-1 rounded hover:bg-amber-600/30"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        <NavLauncher />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6 sm:p-7 pb-24">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/liabilities" element={<Liabilities />} />
              <Route path="/networth" element={<NetWorth />} />
              <Route path="/targets" element={<TargetsAndBills />} />
              <Route path="/flowai" element={<FlowAiConfig />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
