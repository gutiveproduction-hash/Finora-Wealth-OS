import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/format";
import { colorForIndex } from "@/lib/chartColors";

export interface AllocationSlice {
  name: string;
  value: number;
}

export function AllocationDonutChart({ data, currency }: { data: AllocationSlice[]; currency: string }) {
  const filtered = data.filter((d) => d.value > 0);

  if (filtered.length === 0) {
    return <div className="h-56 flex items-center justify-center text-sm text-neutral-400">Belum ada data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          strokeWidth={2}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={colorForIndex(i)} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span className="text-neutral-600 dark:text-neutral-300">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
