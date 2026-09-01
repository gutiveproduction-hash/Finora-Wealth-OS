import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/format";
import { colorForIndex } from "@/lib/chartColors";

export interface AllocationSlice {
  name: string;
  value: number;
}

export function AllocationDonutChart({ data, currency }: { data: AllocationSlice[]; currency: string }) {
  const filtered = data.filter((d) => d.value > 0);
  const total = filtered.reduce((sum, d) => sum + d.value, 0);

  if (filtered.length === 0) {
    return <div className="h-56 flex items-center justify-center text-sm text-neutral-400">Belum ada data</div>;
  }

  return (
    <div className="flex flex-col min-w-0">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={2} strokeWidth={2}>
            {filtered.map((_, i) => (
              <Cell key={i} fill={colorForIndex(i)} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value, currency)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
        {filtered.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between gap-2 text-xs min-w-0" title={`${d.name}: ${formatCurrency(d.value, currency)}`}>
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorForIndex(i) }} />
              <span className="truncate text-neutral-600 dark:text-neutral-300">{d.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-neutral-500 dark:text-neutral-400 font-mono-numbers">
              {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
