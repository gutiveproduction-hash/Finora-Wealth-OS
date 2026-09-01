import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { NetWorthTrendChart } from "@/components/charts/NetWorthTrendChart";
import { AllocationDonutChart } from "@/components/charts/AllocationDonutChart";
import { useNetWorth } from "@/hooks/useNetWorth";
import { useAccounts } from "@/hooks/useAccounts";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatCurrency, formatDate } from "@/lib/format";
import { ASSET_TYPE_LABELS } from "@/lib/chartColors";
import { toBase } from "@/lib/currency";

export default function Dashboard() {
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);
  const ratesMap = useSettingsStore((s) => s.ratesMap);
  const { summary, snapshots, recordSnapshot, loading: nwLoading } = useNetWorth();
  const { accounts } = useAccounts();
  const { assets } = useInvestments();
  const { categories } = useCategories();
  const { transactions } = useTransactions({ limit: 6 });

  const allocationData = useMemo(() => {
    const byType = new Map<string, number>();
    for (const asset of assets) {
      const key = ASSET_TYPE_LABELS[asset.type] ?? asset.type;
      const value = toBase(asset.marketValue, asset.currency, ratesMap);
      byType.set(key, (byType.get(key) ?? 0) + value);
    }
    const cash = accounts
      .filter((a) => a.type !== "investment")
      .reduce((s, a) => s + toBase(a.balance, a.currency, ratesMap), 0);
    if (cash > 0) byType.set("Kas & Tabungan", (byType.get("Kas & Tabungan") ?? 0) + cash);
    return Array.from(byType.entries()).map(([name, value]) => ({ name, value }));
  }, [assets, accounts, ratesMap]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Kekayaan Bersih"
          value={summary ? formatCurrency(summary.netWorth, baseCurrency) : "..."}
          icon={Scale}
          tone={summary && summary.netWorth >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Total Aset"
          value={summary ? formatCurrency(summary.totalAssets, baseCurrency) : "..."}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Liabilitas"
          value={summary ? formatCurrency(summary.totalLiabilities, baseCurrency) : "..."}
          icon={TrendingDown}
        />
        <StatCard
          label="Kas & Tabungan"
          value={summary ? formatCurrency(summary.breakdown.cashAccounts, baseCurrency) : "..."}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Tren Kekayaan Bersih</h2>
            <button className="btn-secondary text-xs" onClick={() => recordSnapshot()} disabled={nwLoading}>
              Catat Snapshot Hari Ini
            </button>
          </div>
          <NetWorthTrendChart snapshots={snapshots} baseCurrency={baseCurrency} />
        </div>
        <div className="card p-5">
          <h2 className="font-medium mb-3">Alokasi Aset</h2>
          <AllocationDonutChart data={allocationData} currency={baseCurrency} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Transaksi Terbaru</h2>
          <Link to="/transactions" className="text-sm text-brand-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">Belum ada transaksi.</p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {transactions.map((t) => {
              const category = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
              const account = accountMap.get(t.accountId);
              return (
                <div key={t.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-medium">{t.note || category?.name || "Transaksi"}</div>
                    <div className="text-xs text-neutral-400">
                      {account?.name} · {formatDate(t.date)}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      t.type === "income" ? "text-emerald-600" : t.type === "expense" ? "text-red-600" : "text-neutral-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                    {formatCurrency(t.amount, t.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
