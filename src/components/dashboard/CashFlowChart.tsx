import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "motion/react";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

export interface CashFlowPoint {
  day: number;
  income: number;
  expense: number;
  net: number;
}

export function CashFlowChart({ data, currency, monthLabel }: { data: CashFlowPoint[]; currency: string; monthLabel: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card p-5 sm:p-6 h-full">
      <div className="pb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Arus Kas</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{monthLabel}</p>
      </div>
      {data.every((d) => d.income === 0 && d.expense === 0) ? (
        <div className="h-64 flex items-center justify-center text-sm text-neutral-400">Belum ada transaksi bulan ini</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="cfIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cfExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200/60 dark:stroke-neutral-800/60" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(v, currency)} width={56} />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
              labelFormatter={(d) => `Tanggal ${d}`}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span className="text-neutral-600 dark:text-neutral-300">{v}</span>} />
            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#cfIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="url(#cfExpense)" strokeWidth={2} />
            <Area type="monotone" dataKey="net" name="Net" stroke="#3b82f6" fill="none" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
