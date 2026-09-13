import { ComposedChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/format";

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export function MonthlyTrendChart({ data, currency }: { data: MonthlyTrendPoint[]; currency: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="card p-5 sm:p-6 h-full">
      <div className="pb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Tren Bulanan</h2>
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          <span>6 bulan terakhir</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Masuk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Keluar
          </span>
        </div>
      </div>
      {data.every((d) => d.income === 0 && d.expense === 0) ? (
        <div className="h-64 flex items-center justify-center text-sm text-neutral-400">Belum ada data historis</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(127,127,127,.08)" }}
              formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
              contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}
            />
            <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[5, 5, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[5, 5, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
