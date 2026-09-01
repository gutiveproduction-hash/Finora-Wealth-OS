import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function AIInsightCard({ insights }: { insights: string[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="card p-5 h-full">
      <div className="flex items-center gap-2 pb-3">
        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">AI Insight</h2>
      </div>

      {insights.length === 0 ? (
        <p className="text-xs text-neutral-400 py-4 text-center">Belum cukup data untuk analisis.</p>
      ) : (
        <ul className="space-y-2.5">
          {insights.map((text, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * idx, duration: 0.3 }}
              className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed flex gap-2"
            >
              <span className="text-amber-500 shrink-0">•</span>
              <span>{text}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
