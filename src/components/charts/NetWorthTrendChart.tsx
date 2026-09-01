import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { NetWorthSnapshot } from "@/types";
import { formatCurrency, formatCompactCurrency, formatDate } from "@/lib/format";

export function NetWorthTrendChart({ snapshots, baseCurrency }: { snapshots: NetWorthSnapshot[]; baseCurrency: string }) {
  const data = snapshots.map((s) => ({
    date: s.date,
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-neutral-400">
        Belum ada data historis. Klik &quot;Catat Snapshot Hari Ini&quot; untuk mulai melacak tren.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22a76d" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22a76d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v)}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v) => formatCompactCurrency(v, baseCurrency)}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value, baseCurrency),
            name === "netWorth" ? "Kekayaan Bersih" : name === "assets" ? "Total Aset" : "Total Liabilitas",
          ]}
          labelFormatter={(v) => formatDate(v as string)}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Area type="monotone" dataKey="netWorth" stroke="#22a76d" strokeWidth={2} fill="url(#netWorthGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
