import { usePortfolioMetrics } from "@/hooks/usePortfolioMetrics";
import { NetWorthTrendChart } from "@/components/charts/NetWorthTrendChart";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { HealthMetricsGrid } from "@/components/dashboard/HealthMetricsGrid";
import { AllocationBreakdown } from "@/components/dashboard/AllocationBreakdown";
import { PortfolioPulseBar } from "@/components/dashboard/PortfolioPulseBar";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatDate } from "@/lib/format";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Scale, TrendingUp, TrendingDown } from "lucide-react";

export default function NetWorth() {
  const {
    summary,
    snapshots,
    recordSnapshot,
    liquidCash,
    monthlyExpenseEstimate,
    liquidMarketTotal,
    investmentGainPct,
    allocationBuckets,
    pulseItems,
    debtRatio,
  } = usePortfolioMetrics();
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const isPrivate = useSettingsStore((s) => s.isPrivate);

  const first = snapshots[0];
  const changeSinceFirst = summary && first ? summary.netWorth - first.netWorth : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Kekayaan Bersih Saat Ini"
          value={summary ? formatCurrency(summary.netWorth, baseCurrency) : "..."}
          icon={Scale}
          tone={summary && summary.netWorth >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Total Aset" value={summary ? formatCurrency(summary.totalAssets, baseCurrency) : "..."} icon={TrendingUp} />
        <StatCard label="Total Liabilitas" value={summary ? formatCurrency(summary.totalLiabilities, baseCurrency) : "..."} icon={TrendingDown} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-medium">Riwayat Kekayaan Bersih</h2>
            {changeSinceFirst !== null && first && (
              <p className="text-xs text-neutral-400">
                {changeSinceFirst >= 0 ? "+" : ""}
                {formatCurrency(changeSinceFirst, baseCurrency)} sejak {formatDate(first.date)}
              </p>
            )}
          </div>
          <button className="btn-primary" onClick={() => recordSnapshot()}>
            Catat Snapshot Hari Ini
          </button>
        </div>
        <NetWorthTrendChart snapshots={snapshots} baseCurrency={baseCurrency} />
      </div>

      <PortfolioPulseBar items={pulseItems} />

      <HealthMetricsGrid
        liquidCash={liquidCash}
        monthlyExpenseEstimate={monthlyExpenseEstimate}
        debtRatio={debtRatio}
        liquidMarketTotal={liquidMarketTotal}
        totalAssets={summary?.totalAssets ?? 0}
        investmentGainPct={investmentGainPct}
        currency={baseCurrency}
        isPrivate={isPrivate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <GrowthChart
            snapshots={snapshots}
            currentNetWorth={summary?.netWorth ?? 0}
            currency={baseCurrency}
            isPrivate={isPrivate}
            onRecordSnapshot={() => recordSnapshot()}
          />
        </div>
        <div className="lg:col-span-4">
          <AllocationBreakdown
            buckets={allocationBuckets}
            totalAssets={summary?.totalAssets ?? 0}
            currency={baseCurrency}
            isPrivate={isPrivate}
          />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-medium mb-3">Semua Snapshot</h2>
        {snapshots.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">
            Belum ada snapshot. Snapshot menyimpan nilai kekayaan bersih pada tanggal tertentu sehingga Anda bisa
            melihat trennya dari waktu ke waktu.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="text-left font-medium py-1.5">Tanggal</th>
                <th className="text-right font-medium py-1.5">Aset</th>
                <th className="text-right font-medium py-1.5">Liabilitas</th>
                <th className="text-right font-medium py-1.5">Kekayaan Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {[...snapshots].reverse().map((s) => (
                <tr key={s.id}>
                  <td className="py-2">{formatDate(s.date)}</td>
                  <td className="py-2 text-right">{formatCurrency(s.totalAssets, baseCurrency)}</td>
                  <td className="py-2 text-right">{formatCurrency(s.totalLiabilities, baseCurrency)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(s.netWorth, baseCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
