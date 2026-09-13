import { useMemo } from "react";
import { useNetWorth } from "@/hooks/useNetWorth";
import { useAccounts } from "@/hooks/useAccounts";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toBase } from "@/lib/currency";
import { formatCompactCurrency } from "@/lib/format";
import type { AllocationBucket } from "@/components/dashboard/AllocationBreakdown";
import type { PulseItem } from "@/components/dashboard/PortfolioPulseBar";

const LIQUID_ASSET_TYPES = new Set(["stock", "mutual_fund", "crypto"]);

/**
 * Portfolio-wide derivations shared by the Dashboard and the Net Worth report.
 * Extracted when the wealth blocks (growth chart, health metrics, allocation,
 * pulse bar) moved off the Dashboard so both pages compute them identically.
 */
export function usePortfolioMetrics() {
  const ratesMap = useSettingsStore((s) => s.ratesMap);
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);

  const { summary, snapshots, recordSnapshot, refresh: refreshNetWorth } = useNetWorth();
  const { accounts, refresh: refreshAccounts } = useAccounts();
  const { assets } = useInvestments();
  const { transactions: expenseHistory, refresh: refreshExpenseHistory } = useTransactions({ type: "expense" });

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
  }, [summary, assets, baseCurrency, ratesMap]);

  const debtRatio = summary && summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0;

  return {
    summary,
    snapshots,
    recordSnapshot,
    refreshNetWorth,
    accounts,
    refreshAccounts,
    assets,
    expenseHistory,
    refreshExpenseHistory,
    liquidCash,
    monthlyExpenseEstimate,
    liquidMarketTotal,
    investmentGainPct,
    allocationBuckets,
    pulseItems,
    debtRatio,
  };
}
