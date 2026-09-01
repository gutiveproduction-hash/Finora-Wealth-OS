import { motion } from "motion/react";

const SIZE = 84;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function tone(score: number) {
  if (score >= 80) return { label: "Sehat", ring: "#10b981", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 50) return { label: "Cukup", ring: "#f59e0b", text: "text-amber-600 dark:text-amber-400" };
  return { label: "Perlu Perhatian", ring: "#f43f5e", text: "text-rose-600 dark:text-rose-400" };
}

/** A composite 0-100 financial health score derived from the user's own savings rate,
 * debt-to-asset ratio, and emergency-fund runway — not an external credit score. */
export function FinancialHealthGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const { label, ring, text } = tone(clamped);
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="card p-4 sm:p-5 flex flex-col items-center justify-center gap-2 text-center">
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 self-start">Status Keuangan</span>
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-neutral-100 dark:stroke-neutral-800" />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ring}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50 font-mono-numbers">{Math.round(clamped)}</span>
        </div>
      </div>
      <span className={`text-xs font-semibold ${text}`}>{label}</span>
    </div>
  );
}
