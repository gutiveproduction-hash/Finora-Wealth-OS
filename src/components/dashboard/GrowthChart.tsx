import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { NetWorthSnapshot } from "@/types";
import { formatDate } from "@/lib/format";
import { AnimatedNumber, AnimatedPercent } from "@/components/ui/AnimatedCounter";

type Timeframe = "1M" | "3M" | "6M" | "1Y" | "ALL";
const TIMEFRAMES: Timeframe[] = ["1M", "3M", "6M", "1Y", "ALL"];
const TIMEFRAME_COUNT: Record<Timeframe, number> = { "1M": 2, "3M": 4, "6M": 7, "1Y": 12, ALL: Infinity };

const WIDTH = 800;
const HEIGHT = 240;
const PAD_X = 40;
const PAD_Y = 30;

export function GrowthChart({
  snapshots,
  currentNetWorth,
  currency,
  isPrivate,
  onRecordSnapshot,
}: {
  snapshots: NetWorthSnapshot[];
  currentNetWorth: number;
  currency: string;
  isPrivate: boolean;
  onRecordSnapshot?: () => void;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    const count = TIMEFRAME_COUNT[timeframe];
    return snapshots.slice(-count);
  }, [snapshots, timeframe]);

  const points = useMemo(() => {
    if (filteredData.length === 0) return [];
    const values = filteredData.map((d) => d.netWorth);
    const minValue = Math.min(...values) * (Math.min(...values) >= 0 ? 0.96 : 1.04);
    const maxValue = Math.max(...values) * (Math.max(...values) >= 0 ? 1.04 : 0.96);
    const range = maxValue - minValue || 1;
    return filteredData.map((d, i) => {
      const x = PAD_X + (i / (filteredData.length - 1 || 1)) * (WIDTH - PAD_X * 2);
      const y = HEIGHT - PAD_Y - ((d.netWorth - minValue) / range) * (HEIGHT - PAD_Y * 2);
      return { x, y, data: d };
    });
  }, [filteredData]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = points[idx - 1];
      const cx = prev.x + (curr.x - prev.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${HEIGHT - PAD_Y} L ${first.x} ${HEIGHT - PAD_Y} Z`;
  }, [linePath, points]);

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const firstVal = filteredData[0]?.netWorth ?? currentNetWorth;
  const lastVal = filteredData[filteredData.length - 1]?.netWorth ?? currentNetWorth;
  const deltaPercent = firstVal !== 0 ? ((lastVal - firstVal) / Math.abs(firstVal)) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Tren Kekayaan Bersih
          </span>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono-numbers">
              <AnimatedNumber value={activePoint?.data.netWorth ?? currentNetWorth} currency={currency} isPrivate={isPrivate} />
            </span>
            {activePoint && <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(activePoint.data.date)}</span>}
            {filteredData.length > 1 && (
              <span className={`text-xs font-semibold ml-1 ${deltaPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                (<AnimatedPercent value={deltaPercent} />)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRecordSnapshot && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={onRecordSnapshot} className="btn-secondary text-xs !px-2.5 !py-1">
              Catat Snapshot Hari Ini
            </motion.button>
          )}
          <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 w-fit">
            {TIMEFRAMES.map((tf) => (
              <motion.button
                key={tf}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setTimeframe(tf);
                  setHoverIndex(null);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeframe === tf
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {tf}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="h-48 sm:h-56 flex items-center justify-center text-sm text-neutral-400 text-center px-4">
          Belum ada data historis. Catat snapshot kekayaan bersih untuk mulai melacak tren.
        </div>
      ) : (
        <div className="w-full overflow-hidden relative select-none">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-48 sm:h-56 overflow-visible" onMouseLeave={() => setHoverIndex(null)}>
            <defs>
              <linearGradient id="netWorthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line x1={PAD_X} y1={PAD_Y} x2={WIDTH - PAD_X} y2={PAD_Y} stroke="currentColor" className="text-neutral-200/50 dark:text-neutral-800/40" strokeDasharray="3 3" />
            <line x1={PAD_X} y1={HEIGHT / 2} x2={WIDTH - PAD_X} y2={HEIGHT / 2} stroke="currentColor" className="text-neutral-200/50 dark:text-neutral-800/40" strokeDasharray="3 3" />
            <line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} stroke="currentColor" className="text-neutral-200/50 dark:text-neutral-800/40" strokeDasharray="3 3" />

            <motion.path key={`area-${timeframe}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} d={areaPath} fill="url(#netWorthAreaGradient)" />

            <motion.path
              key={`line-${timeframe}`}
              initial={{ pathLength: 0, opacity: 0.6 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              d={linePath}
              fill="none"
              stroke="#0D9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.length > 0 && (
              <g>
                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="10" className="fill-teal-500/20 dark:fill-teal-400/20 animate-ping" />
                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4.5" className="fill-teal-600 dark:fill-teal-400 stroke-white dark:stroke-neutral-900" strokeWidth="2" />
              </g>
            )}

            {activePoint && hoverIndex !== null && (
              <g>
                <line x1={activePoint.x} y1={PAD_Y} x2={activePoint.x} y2={HEIGHT - PAD_Y} stroke="currentColor" className="text-neutral-400 dark:text-neutral-500" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={activePoint.x} cy={activePoint.y} r="6" className="fill-teal-600 dark:fill-teal-400 stroke-white dark:stroke-neutral-900" strokeWidth="2.5" />
              </g>
            )}

            {points.map((pt, idx) => (
              <rect
                key={idx}
                x={idx === 0 ? pt.x : (points[idx - 1].x + pt.x) / 2}
                y={0}
                width={idx === points.length - 1 ? WIDTH - pt.x : points[idx + 1].x - pt.x}
                height={HEIGHT}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            ))}
          </svg>

          <div className="flex justify-between items-center text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 px-2 font-mono-numbers">
            <span>{filteredData[0] ? formatDate(filteredData[0].date) : ""}</span>
            <span>{filteredData[Math.floor(filteredData.length / 2)] ? formatDate(filteredData[Math.floor(filteredData.length / 2)].date) : ""}</span>
            <span>{filteredData[filteredData.length - 1] ? formatDate(filteredData[filteredData.length - 1].date) : ""}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
