import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
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

export default function App() {
  const loaded = useSettingsStore((s) => s.loaded);
  const theme = useSettingsStore((s) => s.theme);
  const load = useSettingsStore((s) => s.load);
  const [showDemoBanner, setShowDemoBanner] = useState(IS_DEMO_MODE);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    applyThemeClass(theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass(theme);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  if (!loaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-neutral-400 text-sm">
        Memuat My Networth...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {showDemoBanner && (
        <div className="shrink-0 bg-amber-500 text-amber-950 text-xs sm:text-sm px-4 py-2 flex items-center justify-between gap-3">
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
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/liabilities" element={<Liabilities />} />
              <Route path="/networth" element={<NetWorth />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
