import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "motion/react";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

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
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">6 bulan terakhir</p>
      </div>
      {data.every((d) => d.income === 0 && d.expense === 0) ? (
        <div className="h-64 flex items-center justify-center text-sm text-neutral-400">Belum ada data historis</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200/60 dark:stroke-neutral-800/60" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(v, currency)} width={56} />
            <Tooltip formatter={(value: number, name: string) => [formatCurrency(value, currency), name]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span className="text-neutral-600 dark:text-neutral-300">{v}</span>} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="net" name="Net" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
