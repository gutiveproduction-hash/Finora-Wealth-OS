import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useSettingsStore, applyThemeClass } from "@/store/useSettingsStore";
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
    <div className="h-screen w-screen flex overflow-hidden">
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
  );
}
