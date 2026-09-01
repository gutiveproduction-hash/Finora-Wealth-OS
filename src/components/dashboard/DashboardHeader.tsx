import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";

function greeting(hour: number): string {
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export type MonthView = "current" | "previous";

export function DashboardHeader({
  monthView,
  onChangeMonthView,
  onQuickSpend,
}: {
  monthView: MonthView;
  onChangeMonthView: (view: MonthView) => void;
  onQuickSpend: () => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{greeting(now.getHours())}!</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Berikut ringkasan finansial kamu hari ini.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(now)}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono-numbers">
            {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(now)}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.96 }} onClick={onQuickSpend} className="btn-primary text-xs !px-3 !py-2">
          <Zap size={14} />
          Quick Spend
        </motion.button>

        <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80">
          {(["previous", "current"] as MonthView[]).map((view) => (
            <button
              key={view}
              onClick={() => onChangeMonthView(view)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                monthView === view
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {view === "previous" ? "Bulan Lalu" : "Bulan Ini"}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
