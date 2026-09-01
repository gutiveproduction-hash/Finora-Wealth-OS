import { useMemo, useState } from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle, PiggyBank, Gem } from "lucide-react";
import { NetWorthHero } from "@/components/dashboard/NetWorthHero";
import { HealthMetricsGrid } from "@/components/dashboard/HealthMetricsGrid";
import { PortfolioPulseBar, type PulseItem } from "@/components/dashboard/PortfolioPulseBar";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { AllocationBreakdown, type AllocationBucket } from "@/components/dashboard/AllocationBreakdown";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardHeader, type MonthView } from "@/components/dashboard/DashboardHeader";
import { QuickStatCard } from "@/components/dashboard/QuickStatCard";
import { FinancialHealthGauge } from "@/components/dashboard/FinancialHealthGauge";
import { CashFlowChart, type CashFlowPoint } from "@/components/dashboard/CashFlowChart";
import { MonthlyTrendChart, type MonthlyTrendPoint } from "@/components/dashboard/MonthlyTrendChart";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { BillsSummaryCard } from "@/components/dashboard/BillsSummaryCard";
import { SavingsGoalsProgress } from "@/components/dashboard/SavingsGoalsProgress";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { AccountBalancesList } from "@/components/dashboard/AccountBalancesList";
import { AllocationDonutChart } from "@/components/charts/AllocationDonutChart";
import { GoalModal } from "@/components/Modals/GoalModal";
import { GoalFormModal } from "@/components/Modals/GoalFormModal";
import { ContributeGoalModal } from "@/components/Modals/ContributeGoalModal";
import { BillFormModal } from "@/components/Modals/BillFormModal";
import { QuickSpendModal } from "@/components/Modals/QuickSpendModal";
import { useNetWorth } from "@/hooks/useNetWorth";
import { useAccounts } from "@/hooks/useAccounts";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useGoal } from "@/hooks/useGoal";
import { useSavingsGoals, type SavingsGoal } from "@/hooks/useSavingsGoals";
import { useBills } from "@/hooks/useBills";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toBase } from "@/lib/currency";
import { formatCompactCurrency, formatCurrency, currentMonth, shiftMonth, daysInMonth } from "@/lib/format";

const LIQUID_ASSET_TYPES = new Set(["stock", "mutual_fund", "crypto"]);

export default function Dashboard() {
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const ratesMap = useSettingsStore((s) => s.ratesMap);
  const isPrivate = useSettingsStore((s) => s.isPrivate);

  const { summary, snapshots, recordSnapshot, refresh: refreshNetWorth } = useNetWorth();
  const { accounts, refresh: refreshAccounts } = useAccounts();
  const { assets } = useInvestments();
  const { categories } = useCategories();
  const { transactions: recentTransactions, createTransaction, refresh: refreshRecent } = useTransactions({ limit: 6 });
  const { transactions: expenseHistory, refresh: refreshExpenseHistory } = useTransactions({ type: "expense" });
  const { transactions: allTransactions, refresh: refreshAllTransactions } = useTransactions({});
  const { goal, setGoal } = useGoal();
  const { goals: savingsGoals, addGoal, contribute } = useSavingsGoals();
  const { bills, addBill, markPaid } = useBills();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [isQuickSpendOpen, setIsQuickSpendOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [monthView, setMonthView] = useState<MonthView>("current");

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
    const debtRatioForPulse = summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0;
    const items: PulseItem[] = [
      { id: "networth", symbol: "Net Worth", detail: formatCompactCurrency(summary.netWorth, baseCurrency) },
      { id: "debt-ratio", symbol: "Rasio Hutang", detail: `${debtRatioForPulse.toFixed(1)}%` },
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

  // ---- Month-scoped cash flow (top stat row, cash-flow chart, expense donut) ----
  const selectedMonth = monthView === "current" ? currentMonth() : shiftMonth(currentMonth(), -1);
  const comparisonMonth = shiftMonth(selectedMonth, -1);

  const monthlyTotals = useMemo(() => {
    const byMonth = new Map<string, { income: number; expense: number }>();
    for (const t of allTransactions) {
      if (t.type === "transfer") continue;
      const month = t.date.slice(0, 7);
      const entry = byMonth.get(month) ?? { income: 0, expense: 0 };
      const amount = toBase(t.amount, t.currency, ratesMap);
      if (t.type === "income") entry.income += amount;
      else entry.expense += amount;
      byMonth.set(month, entry);
    }
    return byMonth;
  }, [allTransactions, ratesMap]);

  const selectedTotals = monthlyTotals.get(selectedMonth) ?? { income: 0, expense: 0 };
  const comparisonTotals = monthlyTotals.get(comparisonMonth) ?? { income: 0, expense: 0 };

  const pemasukanChangePct = comparisonTotals.income > 0 ? ((selectedTotals.income - comparisonTotals.income) / comparisonTotals.income) * 100 : undefined;
  const pengeluaranChangePct = comparisonTotals.expense > 0 ? ((selectedTotals.expense - comparisonTotals.expense) / comparisonTotals.expense) * 100 : undefined;

  const savingsRate = selectedTotals.income > 0 ? ((selectedTotals.income - selectedTotals.expense) / selectedTotals.income) * 100 : 0;
  const comparisonSavingsRate = comparisonTotals.income > 0 ? ((comparisonTotals.income - comparisonTotals.expense) / comparisonTotals.income) * 100 : undefined;
  const savingsRateChangePct = comparisonSavingsRate !== undefined ? savingsRate - comparisonSavingsRate : undefined;

  const netFlowSelected = selectedTotals.income - selectedTotals.expense;
  const approxBalanceStart = liquidCash - netFlowSelected;
  const totalSaldoChangePct = approxBalanceStart !== 0 ? (netFlowSelected / Math.abs(approxBalanceStart)) * 100 : undefined;

  const netWorthChangePct = useMemo(() => {
    if (snapshots.length < 2) return undefined;
    const prev = snapshots[snapshots.length - 2];
    return prev.netWorth !== 0 ? ((summary!.netWorth - prev.netWorth) / Math.abs(prev.netWorth)) * 100 : undefined;
  }, [snapshots, summary]);

  const cashFlowData: CashFlowPoint[] = useMemo(() => {
    const days = daysInMonth(selectedMonth);
    const points: CashFlowPoint[] = Array.from({ length: days }, (_, i) => ({ day: i + 1, income: 0, expense: 0, net: 0 }));
    for (const t of allTransactions) {
      if (t.type === "transfer" || t.date.slice(0, 7) !== selectedMonth) continue;
      const day = Number(t.date.slice(8, 10));
      const point = points[day - 1];
      if (!point) continue;
      const amount = toBase(t.amount, t.currency, ratesMap);
      if (t.type === "income") point.income += amount;
      else point.expense += amount;
    }
    for (const p of points) p.net = p.income - p.expense;
    return points;
  }, [allTransactions, selectedMonth, ratesMap]);

  const monthlyTrendData: MonthlyTrendPoint[] = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(currentMonth(), i - 5));
    return months.map((month) => {
      const totals = monthlyTotals.get(month) ?? { income: 0, expense: 0 };
      const [y, m] = month.split("-").map(Number);
      const label = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(y, m - 1, 1));
      return { month, label, income: totals.income, expense: totals.expense, net: totals.income - totals.expense };
    });
  }, [monthlyTotals]);

  const expenseBreakdown = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const t of allTransactions) {
      if (t.type !== "expense" || t.date.slice(0, 7) !== selectedMonth) continue;
      const name = (t.categoryId && categoryMap.get(t.categoryId)?.name) || "Lainnya";
      byCategory.set(name, (byCategory.get(name) ?? 0) + toBase(t.amount, t.currency, ratesMap));
    }
    return Array.from(byCategory.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allTransactions, selectedMonth, categoryMap, ratesMap]);

  const healthScore = useMemo(() => {
    if (!summary) return 0;
    const debtRatioForScore = summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0;
    const emergencyRunwayMonths = monthlyExpenseEstimate > 0 ? liquidCash / monthlyExpenseEstimate : 0;
    const savingsScore = Math.max(0, Math.min(40, savingsRate));
    const debtScore = Math.max(0, Math.min(30, 30 - debtRatioForScore * 0.3));
    const emergencyScore = Math.max(0, Math.min(30, (emergencyRunwayMonths / 6) * 30));
    return savingsScore + debtScore + emergencyScore;
  }, [summary, monthlyExpenseEstimate, liquidCash, savingsRate]);

  const insights = useMemo(() => {
    const lines: string[] = [];
    if (selectedTotals.income > 0) {
      lines.push(
        savingsRate >= 20
          ? `Kamu sudah mencapai ${savingsRate.toFixed(1)}% saving rate bulan ini. Pertahankan!`
          : `Saving rate bulan ini baru ${savingsRate.toFixed(1)}%, coba kurangi pengeluaran non-esensial.`
      );
    }
    if (expenseBreakdown.length > 0) {
      const top = expenseBreakdown[0];
      const pct = selectedTotals.expense > 0 ? (top.value / selectedTotals.expense) * 100 : 0;
      lines.push(`Kategori ${top.name} adalah pengeluaran terbesar bulan ini (${pct.toFixed(1)}%).`);
    }
    if (savingsGoals.length > 0) {
      const lowest = [...savingsGoals].sort(
        (a, b) => (a.currentAmount / (a.targetAmount || 1)) - (b.currentAmount / (b.targetAmount || 1))
      )[0];
      lines.push(`Fokus tabungan: ${lowest.title}. Kamu pasti bisa!`);
    }
    return lines;
  }, [selectedTotals, savingsRate, expenseBreakdown, savingsGoals]);

  async function refreshAfterQuickSpend() {
    await Promise.all([refreshRecent(), refreshExpenseHistory(), refreshAllTransactions(), refreshAccounts(), refreshNetWorth()]);
  }

  if (!summary) {
    return <div className="text-sm text-neutral-400 py-12 text-center">Memuat data...</div>;
  }

  const debtRatio = summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0;
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)) - 1, 1)
  );

  return (
    <div className="space-y-6">
      <DashboardHeader monthView={monthView} onChangeMonthView={setMonthView} onQuickSpend={() => setIsQuickSpendOpen(true)} />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <QuickStatCard label="Total Saldo" value={formatCurrency(liquidCash, baseCurrency)} icon={Wallet} changePct={totalSaldoChangePct} isPrivate={isPrivate} />
        <QuickStatCard
          label="Pemasukan"
          value={formatCurrency(selectedTotals.income, baseCurrency)}
          icon={ArrowUpCircle}
          tone="positive"
          changePct={pemasukanChangePct}
          isPrivate={isPrivate}
        />
        <QuickStatCard
          label="Pengeluaran"
          value={formatCurrency(selectedTotals.expense, baseCurrency)}
          icon={ArrowDownCircle}
          tone="negative"
          changePct={pengeluaranChangePct}
          invertTone
          isPrivate={isPrivate}
        />
        <QuickStatCard label="Rasio Tabungan" value={`${savingsRate.toFixed(0)}%`} icon={PiggyBank} changePct={savingsRateChangePct} isPrivate={isPrivate} />
        <QuickStatCard label="Nilai Kekayaan" value={formatCurrency(summary.netWorth, baseCurrency)} icon={Gem} changePct={netWorthChangePct} isPrivate={isPrivate} />
        <FinancialHealthGauge score={healthScore} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <CashFlowChart data={cashFlowData} currency={baseCurrency} monthLabel={monthLabel} />
        </div>
        <div className="lg:col-span-3">
          <div className="card p-5 h-full">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Rincian Pengeluaran</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{monthLabel}</p>
            {expenseBreakdown.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-sm text-neutral-400">Belum ada pengeluaran</div>
            ) : (
              <AllocationDonutChart data={expenseBreakdown} currency={baseCurrency} />
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <UpcomingBills bills={bills} currency={baseCurrency} onMarkPaid={markPaid} onAdd={() => setIsBillFormOpen(true)} />
        </div>
        <div className="lg:col-span-2">
          <SavingsGoalsProgress
            goals={savingsGoals}
            currency={baseCurrency}
            onAddGoal={() => setIsGoalFormOpen(true)}
            onContribute={(g) => setContributingGoal(g)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-3">
          <AIInsightCard insights={insights} />
        </div>
        <div className="lg:col-span-4">
          <MonthlyTrendChart data={monthlyTrendData} currency={baseCurrency} />
        </div>
        <div className="lg:col-span-2">
          <BillsSummaryCard bills={bills} currency={baseCurrency} />
        </div>
        <div className="lg:col-span-3">
          <AccountBalancesList accounts={accounts} isPrivate={isPrivate} />
        </div>
      </div>

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

      <GoalFormModal open={isGoalFormOpen} onClose={() => setIsGoalFormOpen(false)} onSave={addGoal} currency={baseCurrency} />

      <ContributeGoalModal
        open={contributingGoal !== null}
        onClose={() => setContributingGoal(null)}
        goalTitle={contributingGoal?.title ?? ""}
        onSave={(amount) => {
          if (contributingGoal) contribute(contributingGoal.id, amount);
        }}
        currency={baseCurrency}
      />

      <BillFormModal open={isBillFormOpen} onClose={() => setIsBillFormOpen(false)} onSave={addBill} currency={baseCurrency} />

      <QuickSpendModal
        open={isQuickSpendOpen}
        onClose={() => setIsQuickSpendOpen(false)}
        accounts={accounts}
        categories={categories}
        onSave={async (input) => {
          await createTransaction({ ...input, type: "expense" });
          await refreshAfterQuickSpend();
        }}
      />
    </div>
  );
}
