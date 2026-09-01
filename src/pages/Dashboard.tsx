import { useMemo, useState } from "react";
import { NetWorthHero } from "@/components/dashboard/NetWorthHero";
import { HealthMetricsGrid } from "@/components/dashboard/HealthMetricsGrid";
import { PortfolioPulseBar, type PulseItem } from "@/components/dashboard/PortfolioPulseBar";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { AllocationBreakdown, type AllocationBucket } from "@/components/dashboard/AllocationBreakdown";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GoalModal } from "@/components/Modals/GoalModal";
import { useNetWorth } from "@/hooks/useNetWorth";
import { useAccounts } from "@/hooks/useAccounts";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useGoal } from "@/hooks/useGoal";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toBase } from "@/lib/currency";
import { formatCompactCurrency } from "@/lib/format";

const LIQUID_ASSET_TYPES = new Set(["stock", "mutual_fund", "crypto"]);

export default function Dashboard() {
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const ratesMap = useSettingsStore((s) => s.ratesMap);
  const isPrivate = useSettingsStore((s) => s.isPrivate);

  const { summary, snapshots, recordSnapshot } = useNetWorth();
  const { accounts } = useAccounts();
  const { assets } = useInvestments();
  const { categories } = useCategories();
  const { transactions: recentTransactions } = useTransactions({ limit: 6 });
  const { transactions: expenseHistory } = useTransactions({ type: "expense" });
  const { goal, setGoal } = useGoal();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const liquidCash = useMemo(
    () =>
      accounts
        .filter((a) => a.type !== "investment" && !a.archived)
        .reduce((sum, a) => sum + toBase(a.balance, a.currency, ratesMap), 0),
    [accounts, ratesMap]
  );

  const monthlyExpenseEstimate = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const t of expenseHistory) {
      const month = t.date.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + toBase(t.amount, t.currency, ratesMap));
    }
    if (byMonth.size === 0) return 0;
    const total = Array.from(byMonth.values()).reduce((s, v) => s + v, 0);
    return total / byMonth.size;
  }, [expenseHistory, ratesMap]);

  const liquidMarketTotal = useMemo(() => {
    const marketAssets = assets
      .filter((a) => LIQUID_ASSET_TYPES.has(a.type))
      .reduce((sum, a) => sum + toBase(a.marketValue, a.currency, ratesMap), 0);
    return liquidCash + marketAssets;
  }, [assets, liquidCash, ratesMap]);

  const investmentGainPct = useMemo(() => {
    const totals = assets.reduce(
      (acc, a) => {
        acc.cost += toBase(a.totalCost, a.currency, ratesMap);
        acc.gain += toBase(a.gain, a.currency, ratesMap);
        return acc;
      },
      { cost: 0, gain: 0 }
    );
    return totals.cost > 0 ? (totals.gain / totals.cost) * 100 : 0;
  }, [assets, ratesMap]);

  const allocationBuckets: AllocationBucket[] = useMemo(() => {
    const byType = new Map<string, { count: number; total: number }>();
    for (const asset of assets) {
      const entry = byType.get(asset.type) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += toBase(asset.marketValue, asset.currency, ratesMap);
      byType.set(asset.type, entry);
    }
    const cashAccountCount = accounts.filter((a) => a.type !== "investment" && !a.archived).length;
    const buckets = Array.from(byType.entries()).map(([key, v]) => ({ key, ...v }));
    if (liquidCash > 0) buckets.push({ key: "cash", count: cashAccountCount, total: liquidCash });
    return buckets;
  }, [assets, accounts, liquidCash, ratesMap]);

  const pulseItems: PulseItem[] = useMemo(() => {
    if (!summary) return [];
    const debtRatio = summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0;
    const items: PulseItem[] = [
      { id: "networth", symbol: "Net Worth", detail: formatCompactCurrency(summary.netWorth, baseCurrency) },
      { id: "debt-ratio", symbol: "Rasio Hutang", detail: `${debtRatio.toFixed(1)}%` },
    ];
    const topAssets = [...assets].sort((a, b) => b.marketValue - a.marketValue).slice(0, 6);
    for (const asset of topAssets) {
      items.push({
        id: asset.id,
        symbol: asset.symbol || asset.name,
        detail: formatCompactCurrency(toBase(asset.marketValue, asset.currency, ratesMap), baseCurrency),
        changePercent: asset.gainPct,
      });
    }
    return items;
  }, [summary, assets, ratesMap, baseCurrency]);

  if (!summary) {
    return <div className="text-sm text-neutral-400 py-12 text-center">Memuat data...</div>;
  }

  const debtRatio = summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0;

  return (
    <div className="space-y-6">
      <PortfolioPulseBar items={pulseItems} />

      <NetWorthHero
        netWorth={summary.netWorth}
        totalAssets={summary.totalAssets}
        totalLiabilities={summary.totalLiabilities}
        snapshots={snapshots}
        currency={baseCurrency}
        isPrivate={isPrivate}
        goal={goal}
        onOpenGoal={() => setIsGoalModalOpen(true)}
      />

      <HealthMetricsGrid
        liquidCash={liquidCash}
        monthlyExpenseEstimate={monthlyExpenseEstimate}
        debtRatio={debtRatio}
        liquidMarketTotal={liquidMarketTotal}
        totalAssets={summary.totalAssets}
        investmentGainPct={investmentGainPct}
        currency={baseCurrency}
        isPrivate={isPrivate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <GrowthChart
            snapshots={snapshots}
            currentNetWorth={summary.netWorth}
            currency={baseCurrency}
            isPrivate={isPrivate}
            onRecordSnapshot={() => recordSnapshot()}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AllocationBreakdown buckets={allocationBuckets} totalAssets={summary.totalAssets} currency={baseCurrency} isPrivate={isPrivate} />
          <ActivityFeed transactions={recentTransactions} categoryMap={categoryMap} accountMap={accountMap} isPrivate={isPrivate} />
        </div>
      </div>

      <GoalModal open={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} goal={goal} onSave={setGoal} currency={baseCurrency} />
    </div>
  );
}
