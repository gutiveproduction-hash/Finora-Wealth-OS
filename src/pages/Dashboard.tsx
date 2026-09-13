import { useMemo, useState } from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle, PiggyBank } from "lucide-react";
import { NetWorthHero } from "@/components/dashboard/NetWorthHero";
import { DashboardHeader, type MonthView } from "@/components/dashboard/DashboardHeader";
import { QuickStatCard } from "@/components/dashboard/QuickStatCard";
import { FinancialHealthGauge } from "@/components/dashboard/FinancialHealthGauge";
import { CashFlowChart, type CashFlowPoint } from "@/components/dashboard/CashFlowChart";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { SavingsGoalsProgress } from "@/components/dashboard/SavingsGoalsProgress";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
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
import { useAiInsightSettings } from "@/hooks/useAiInsightSettings";
import { useSettingsStore } from "@/store/useSettingsStore";
import { toBase } from "@/lib/currency";
import { formatCurrency, currentMonth, shiftMonth, daysInMonth } from "@/lib/format";

const LIQUID_ASSET_TYPES = new Set(["stock", "mutual_fund", "crypto"]);

export default function Dashboard() {
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const ratesMap = useSettingsStore((s) => s.ratesMap);
  const isPrivate = useSettingsStore((s) => s.isPrivate);

  const { summary, snapshots, refresh: refreshNetWorth } = useNetWorth();
  const { accounts, refresh: refreshAccounts } = useAccounts();
  const { assets } = useInvestments();
  const { categories } = useCategories();
  const { createTransaction, refresh: refreshRecent } = useTransactions({ limit: 6 });
  const { transactions: expenseHistory, refresh: refreshExpenseHistory } = useTransactions({ type: "expense" });
  const { transactions: allTransactions, refresh: refreshAllTransactions } = useTransactions({});
  const { goal, setGoal } = useGoal();
  const { goals: savingsGoals, addGoal, contribute } = useSavingsGoals();
  const { bills, addBill, markPaid } = useBills();
  const { settings: aiSettings } = useAiInsightSettings();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [isQuickSpendOpen, setIsQuickSpendOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [monthView, setMonthView] = useState<MonthView>("current");

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

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

  // "Total Saldo" selalu menampilkan saldo LIVE hari ini, tidak ikut toggle Bulan Ini/Bulan
  // Lalu di atas (lihat pemakaiannya di bawah — nilainya selalu `liquidCash`, bukan
  // `selectedTotals`). Perubahannya karena itu harus dibandingkan terhadap arus kas bulan
  // BERJALAN, bukan `selectedTotals` yang ikut berubah saat toggle "Bulan Lalu" — kalau
  // tidak, membuka "Bulan Lalu" akan mencampur saldo hari ini dengan arus kas bulan lalu
  // dan menghasilkan persentase yang salah/tidak masuk akal.
  const currentMonthTotals = monthlyTotals.get(currentMonth()) ?? { income: 0, expense: 0 };
  const netFlowThisMonth = currentMonthTotals.income - currentMonthTotals.expense;
  const approxBalanceStart = liquidCash - netFlowThisMonth;
  const totalSaldoChangePct = approxBalanceStart !== 0 ? (netFlowThisMonth / Math.abs(approxBalanceStart)) * 100 : undefined;

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
    if (!aiSettings.enabled) return lines;
    if (selectedTotals.income > 0) {
      lines.push(
        savingsRate >= aiSettings.healthySavingsRate
          ? `Kamu sudah mencapai ${savingsRate.toFixed(1)}% saving rate bulan ini. Pertahankan!`
          : `Saving rate bulan ini baru ${savingsRate.toFixed(1)}%, coba kurangi pengeluaran non-esensial.`
      );
    }
    if (aiSettings.showTopExpenseInsight && expenseBreakdown.length > 0) {
      const top = expenseBreakdown[0];
      const pct = selectedTotals.expense > 0 ? (top.value / selectedTotals.expense) * 100 : 0;
      lines.push(`Kategori ${top.name} adalah pengeluaran terbesar bulan ini (${pct.toFixed(1)}%).`);
    }
    if (aiSettings.showGoalFocusInsight && savingsGoals.length > 0) {
      const lowest = [...savingsGoals].sort(
        (a, b) => (a.currentAmount / (a.targetAmount || 1)) - (b.currentAmount / (b.targetAmount || 1))
      )[0];
      lines.push(`Fokus tabungan: ${lowest.title}. Kamu pasti bisa!`);
    }
    return lines;
  }, [selectedTotals, savingsRate, expenseBreakdown, savingsGoals, aiSettings]);

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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <QuickStatCard
          label="Total Saldo"
          value={formatCurrency(liquidCash, baseCurrency)}
          icon={Wallet}
          changePct={totalSaldoChangePct}
          changeLabel="sejak awal bulan ini"
          isPrivate={isPrivate}
        />
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
        <FinancialHealthGauge score={healthScore} />
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <CashFlowChart data={cashFlowData} currency={baseCurrency} monthLabel={monthLabel} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <UpcomingBills bills={bills} currency={baseCurrency} onMarkPaid={markPaid} onAdd={() => setIsBillFormOpen(true)} />
        <SavingsGoalsProgress
          goals={savingsGoals}
          currency={baseCurrency}
          onAddGoal={() => setIsGoalFormOpen(true)}
          onContribute={(g) => setContributingGoal(g)}
        />
      </div>

      <AIInsightCard insights={insights} />

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
