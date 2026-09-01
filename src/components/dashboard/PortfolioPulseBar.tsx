import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface PulseItem {
  id: string;
  symbol: string;
  detail: string;
  changePercent?: number;
}

/** A live-feeling horizontal ticker — visually modeled after a market ticker, but every
 * number here is a real, locally-derived metric from the user's own data (net worth,
 * ratios, and their actual holdings' unrealized gain/loss). This app is offline-first by
 * design and never fetches external market prices, so nothing here is a live quote. */
export function PortfolioPulseBar({ items }: { items: PulseItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="w-full bg-white/70 dark:bg-[#15171C]/80 backdrop-blur-md border border-neutral-200/70 dark:border-neutral-800/80 rounded-2xl px-4 py-2.5 shadow-2xs overflow-hidden flex items-center gap-3">
      <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] tracking-wide uppercase font-semibold text-neutral-600 dark:text-neutral-400">
          Portofolio Pulse
        </span>
      </div>

      <div className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 select-none">
        {items.map((item) => {
          const isUp = (item.changePercent ?? 0) >= 0;
          const hasChange = item.changePercent !== undefined;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 shrink-0 text-xs"
            >
              <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono-numbers">{item.symbol}</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-mono-numbers text-[11px]">{item.detail}</span>
              {hasChange && (
                <span className={`inline-flex items-center gap-0.5 font-semibold text-[11px] font-mono-numbers ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp && item.changePercent !== 0 ? "+" : ""}
                  {item.changePercent!.toFixed(2)}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
