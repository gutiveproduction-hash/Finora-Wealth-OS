import type {
  Account,
  AccountType,
  Asset,
  AssetType,
  Budget,
  Category,
  CategoryType,
  ExchangeRate,
  Holding,
  Liability,
  LiabilityType,
  MyNetworthApi,
  NetWorthSnapshot,
  NetWorthSummary,
  Transaction,
  TransactionType,
} from "@/types";

/**
 * Browser demo/preview mode.
 *
 * Finora is a desktop app: the real `window.api` is injected by
 * electron/preload.ts and backed by a local SQLite database. That only
 * exists when the app runs inside Electron.
 *
 * If someone opens dist/index.html (or a hosted copy of it) directly in a
 * regular browser — no Electron, no preload — `window.api` would be
 * `undefined` and the whole UI would fail to load. Rather than showing a
 * blank page, this file installs a lightweight, fully in-browser stand-in
 * that implements the exact same `MyNetworthApi` shape, backed by an
 * in-memory store persisted to `localStorage`. It's seeded with sample data
 * so visitors can click around and see what the app looks like before
 * installing it for real. A banner (see App.tsx) makes clear this is a demo.
 *
 * Import/CSV and file-backed backup are the only things that don't make
 * sense without a real filesystem — those are stubbed to explain that
 * limitation rather than pretending to work.
 */

const STORAGE_KEY = "my-networth-demo-store-v1";
export const IS_DEMO_MODE = typeof window !== "undefined" && !("api" in window);

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function todayIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function monthIso(offsetMonths = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toISOString().slice(0, 7);
}

interface Store {
  settings: Record<string, string>;
  accounts: Omit<Account, "balance">[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  assets: Omit<
    Asset,
    "totalQty" | "totalCost" | "avgBuyPrice" | "marketValue" | "gain" | "gainPct" | "holdings"
  >[];
  holdings: Holding[];
  liabilities: Liability[];
  netWorthSnapshots: NetWorthSnapshot[];
  exchangeRates: ExchangeRate[];
}

function seedStore(): Store {
  const now = new Date().toISOString();
  const accBca = uuid();
  const accGopay = uuid();
  const accCash = uuid();
  const catGaji = uuid();
  const catMakan = uuid();
  const catTransport = uuid();
  const catBelanja = uuid();
  const catTagihan = uuid();
  const assetBbca = uuid();
  const assetBtc = uuid();

  const categories: Category[] = [
    { id: catGaji, name: "Gaji", type: "income", color: "#22a76d", icon: "banknote", isDefault: true, createdAt: now },
    { id: uuid(), name: "Bonus & THR", type: "income", color: "#16a34a", icon: "gift", isDefault: true, createdAt: now },
    { id: uuid(), name: "Investasi Masuk", type: "income", color: "#0891b2", icon: "trending-up", isDefault: true, createdAt: now },
    { id: uuid(), name: "Lainnya (Pemasukan)", type: "income", color: "#64748b", icon: "plus-circle", isDefault: true, createdAt: now },
    { id: catMakan, name: "Makanan & Minuman", type: "expense", color: "#f97316", icon: "utensils", isDefault: true, createdAt: now },
    { id: catTransport, name: "Transportasi", type: "expense", color: "#3b82f6", icon: "car", isDefault: true, createdAt: now },
    { id: catBelanja, name: "Belanja", type: "expense", color: "#ec4899", icon: "shopping-bag", isDefault: true, createdAt: now },
    { id: catTagihan, name: "Tagihan & Utilitas", type: "expense", color: "#eab308", icon: "receipt", isDefault: true, createdAt: now },
    { id: uuid(), name: "Kesehatan", type: "expense", color: "#ef4444", icon: "heart-pulse", isDefault: true, createdAt: now },
    { id: uuid(), name: "Hiburan", type: "expense", color: "#8b5cf6", icon: "clapperboard", isDefault: true, createdAt: now },
    { id: uuid(), name: "Pendidikan", type: "expense", color: "#06b6d4", icon: "graduation-cap", isDefault: true, createdAt: now },
    { id: uuid(), name: "Cicilan & Utang", type: "expense", color: "#dc2626", icon: "landmark", isDefault: true, createdAt: now },
    { id: uuid(), name: "Lainnya (Pengeluaran)", type: "expense", color: "#64748b", icon: "minus-circle", isDefault: true, createdAt: now },
  ];

  const transactions: Transaction[] = [
    { id: uuid(), accountId: accBca, categoryId: catGaji, type: "income", transferAccountId: null, amount: 12000000, currency: "IDR", date: todayIso(-28), note: "Gaji bulanan", createdAt: now },
    { id: uuid(), accountId: accBca, categoryId: catTagihan, type: "expense", transferAccountId: null, amount: 850000, currency: "IDR", date: todayIso(-25), note: "Listrik & internet", createdAt: now },
    { id: uuid(), accountId: accBca, categoryId: null, type: "transfer", transferAccountId: accGopay, amount: 1500000, currency: "IDR", date: todayIso(-24), note: "Top up GoPay", createdAt: now },
    { id: uuid(), accountId: accGopay, categoryId: catMakan, type: "expense", transferAccountId: null, amount: 65000, currency: "IDR", date: todayIso(-20), note: "Makan siang", createdAt: now },
    { id: uuid(), accountId: accGopay, categoryId: catTransport, type: "expense", transferAccountId: null, amount: 45000, currency: "IDR", date: todayIso(-18), note: "Ojek online", createdAt: now },
    { id: uuid(), accountId: accBca, categoryId: catBelanja, type: "expense", transferAccountId: null, amount: 420000, currency: "IDR", date: todayIso(-15), note: "Belanja bulanan", createdAt: now },
    { id: uuid(), accountId: accCash, categoryId: catMakan, type: "expense", transferAccountId: null, amount: 30000, currency: "IDR", date: todayIso(-10), note: "Jajan", createdAt: now },
    { id: uuid(), accountId: accBca, categoryId: catGaji, type: "income", transferAccountId: null, amount: 12000000, currency: "IDR", date: todayIso(-2), note: "Gaji bulanan", createdAt: now },
    { id: uuid(), accountId: accGopay, categoryId: catMakan, type: "expense", transferAccountId: null, amount: 52000, currency: "IDR", date: todayIso(-1), note: "Kopi & sarapan", createdAt: now },
  ];

  const budgets: Budget[] = [
    { id: uuid(), categoryId: catMakan, month: monthIso(0), amount: 2000000, currency: "IDR", createdAt: now },
    { id: uuid(), categoryId: catTransport, month: monthIso(0), amount: 800000, currency: "IDR", createdAt: now },
    { id: uuid(), categoryId: catBelanja, month: monthIso(0), amount: 1500000, currency: "IDR", createdAt: now },
  ];

  return {
    settings: { baseCurrency: "IDR", theme: "system", schemaVersion: "1" },
    accounts: [
      { id: accBca, name: "BCA", type: "bank", currency: "IDR", initialBalance: 8000000, color: "#22a76d", icon: "wallet", archived: false, createdAt: now },
      { id: accGopay, name: "GoPay", type: "ewallet", currency: "IDR", initialBalance: 250000, color: "#3b82f6", icon: "wallet", archived: false, createdAt: now },
      { id: accCash, name: "Dompet Tunai", type: "cash", currency: "IDR", initialBalance: 500000, color: "#f97316", icon: "wallet", archived: false, createdAt: now },
    ],
    categories,
    transactions,
    budgets,
    assets: [
      { id: assetBbca, name: "Bank Central Asia", symbol: "BBCA", type: "stock", currency: "IDR", currentPrice: 10200, notes: "", excludeFromBalance: false, createdAt: now, updatedAt: now },
      { id: assetBtc, name: "Bitcoin", symbol: "BTC", type: "crypto", currency: "USD", currentPrice: 62000, notes: "", excludeFromBalance: false, createdAt: now, updatedAt: now },
    ],
    holdings: [
      { id: uuid(), assetId: assetBbca, accountId: accBca, quantity: 500, avgBuyPrice: 9200, currency: "IDR", createdAt: now },
      { id: uuid(), assetId: assetBtc, accountId: null, quantity: 0.05, avgBuyPrice: 55000, currency: "USD", createdAt: now },
    ],
    liabilities: [
      { id: uuid(), name: "KPR Rumah", type: "mortgage", balance: 350000000, currency: "IDR", interestRate: 6.5, dueDate: null, notes: "", createdAt: now, updatedAt: now },
    ],
    netWorthSnapshots: [
      { id: uuid(), date: todayIso(-60), totalAssets: 20000000, totalLiabilities: 355000000, netWorth: -335000000, baseCurrency: "IDR", createdAt: now },
      { id: uuid(), date: todayIso(-30), totalAssets: 25000000, totalLiabilities: 353000000, netWorth: -328000000, baseCurrency: "IDR", createdAt: now },
    ],
    exchangeRates: [
      { id: uuid(), currency: "IDR", rateToBase: 1, updatedAt: now },
      { id: uuid(), currency: "USD", rateToBase: 16000, updatedAt: now },
      { id: uuid(), currency: "EUR", rateToBase: 17300, updatedAt: now },
      { id: uuid(), currency: "SGD", rateToBase: 11900, updatedAt: now },
      { id: uuid(), currency: "JPY", rateToBase: 107, updatedAt: now },
      { id: uuid(), currency: "GBP", rateToBase: 20200, updatedAt: now },
      { id: uuid(), currency: "AUD", rateToBase: 10500, updatedAt: now },
      { id: uuid(), currency: "MYR", rateToBase: 3600, updatedAt: now },
    ],
  };
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // ignore corrupt storage, fall through to a fresh seed
  }
  const seeded = seedStore();
  persist(seeded);
  return seeded;
}

function persist(s: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // localStorage can be unavailable (private browsing, quota) — demo mode
    // just won't persist across reloads in that case, which is acceptable.
  }
}

const store = typeof window !== "undefined" && IS_DEMO_MODE ? loadStore() : ({} as Store);
const save = () => persist(store);

function computeAccountBalance(accountId: string): number {
  const acc = store.accounts.find((a) => a.id === accountId);
  if (!acc) return 0;
  let balance = acc.initialBalance;
  for (const t of store.transactions) {
    if (t.type === "income" && t.accountId === accountId) balance += t.amount;
    else if (t.type === "expense" && t.accountId === accountId) balance -= t.amount;
    else if (t.type === "transfer" && t.accountId === accountId) balance -= t.amount;
    else if (t.type === "transfer" && t.transferAccountId === accountId) balance += t.amount;
  }
  return balance;
}

function withAccountBalances(): Account[] {
  return store.accounts.map((a) => ({ ...a, balance: computeAccountBalance(a.id) }));
}

function withAssetAggregates(): Asset[] {
  return store.assets.map((asset) => {
    const assetHoldings = store.holdings.filter((h) => h.assetId === asset.id);
    const totalQty = assetHoldings.reduce((s, h) => s + h.quantity, 0);
    const totalCost = assetHoldings.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0);
    const avgBuyPrice = totalQty > 0 ? totalCost / totalQty : 0;
    const marketValue = totalQty * asset.currentPrice;
    const gain = marketValue - totalCost;
    const gainPct = totalCost > 0 ? (gain / totalCost) * 100 : 0;
    return { ...asset, totalQty, totalCost, avgBuyPrice, marketValue, gain, gainPct, holdings: assetHoldings };
  });
}

function ratesMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of store.exchangeRates) map[r.currency] = r.rateToBase;
  return map;
}

function toBase(amount: number, currency: string): number {
  const map = ratesMap();
  return amount * (map[currency] ?? 1);
}

function computeNetWorthSummary(): NetWorthSummary {
  const cashTotal = store.accounts
    .filter((a) => !a.archived)
    .reduce((s, a) => s + toBase(computeAccountBalance(a.id), a.currency), 0);
  const investmentsTotal = withAssetAggregates()
    .filter((a) => !a.excludeFromBalance)
    .reduce((s, a) => s + toBase(a.marketValue, a.currency), 0);
  const liabilitiesTotal = store.liabilities.reduce((s, l) => s + toBase(l.balance, l.currency), 0);
  const totalAssets = cashTotal + investmentsTotal;
  return {
    totalAssets,
    totalLiabilities: liabilitiesTotal,
    netWorth: totalAssets - liabilitiesTotal,
    baseCurrency: store.settings.baseCurrency ?? "IDR",
    breakdown: { cashAccounts: cashTotal, investments: investmentsTotal },
  };
}

const ok = <T,>(value: T) => Promise.resolve(value);

export function createMockApi(): MyNetworthApi {
  return {
    accounts: {
      list: () => ok(withAccountBalances()),
      create: (input) => {
        const row = {
          id: uuid(),
          name: input.name ?? "Akun Baru",
          type: (input.type ?? "bank") as AccountType,
          currency: input.currency ?? "IDR",
          initialBalance: input.initialBalance ?? 0,
          color: input.color ?? "#22a76d",
          icon: input.icon ?? "wallet",
          archived: false,
          createdAt: new Date().toISOString(),
        };
        store.accounts.push(row);
        save();
        return ok({ ...row, balance: computeAccountBalance(row.id) });
      },
      update: (id, patch) => {
        const acc = store.accounts.find((a) => a.id === id);
        if (acc) Object.assign(acc, patch);
        save();
        return ok(true);
      },
      delete: (id) => {
        const used =
          store.transactions.some((t) => t.accountId === id || t.transferAccountId === id) ||
          store.holdings.some((h) => h.accountId === id);
        if (used) {
          return ok({ ok: false, reason: "Akun ini masih punya transaksi atau holding terkait di data demo." });
        }
        store.accounts = store.accounts.filter((a) => a.id !== id);
        save();
        return ok({ ok: true });
      },
    },

    categories: {
      list: () => ok(store.categories),
      create: (input) => {
        const row: Category = {
          id: uuid(),
          name: input.name ?? "Kategori Baru",
          type: (input.type ?? "expense") as CategoryType,
          color: input.color ?? "#64748b",
          icon: input.icon ?? "tag",
          isDefault: false,
          createdAt: new Date().toISOString(),
        };
        store.categories.push(row);
        save();
        return ok(row);
      },
      update: (id, patch) => {
        const cat = store.categories.find((c) => c.id === id);
        if (cat) Object.assign(cat, patch);
        save();
        return ok(true);
      },
      delete: (id) => {
        if (store.transactions.some((t) => t.categoryId === id)) {
          return ok({ ok: false, reason: "Kategori ini masih dipakai transaksi di data demo." });
        }
        store.categories = store.categories.filter((c) => c.id !== id);
        save();
        return ok({ ok: true });
      },
    },

    transactions: {
      list: (filters = {}) => {
        let rows = [...store.transactions];
        const f = filters as Record<string, unknown>;
        if (f.accountId) rows = rows.filter((t) => t.accountId === f.accountId || t.transferAccountId === f.accountId);
        if (f.categoryId) rows = rows.filter((t) => t.categoryId === f.categoryId);
        if (f.type) rows = rows.filter((t) => t.type === f.type);
        if (f.dateFrom) rows = rows.filter((t) => t.date >= (f.dateFrom as string));
        if (f.dateTo) rows = rows.filter((t) => t.date <= (f.dateTo as string));
        if (f.search) rows = rows.filter((t) => t.note.toLowerCase().includes((f.search as string).toLowerCase()));
        rows.sort((a, b) => (a.date < b.date ? 1 : -1));
        if (f.limit) rows = rows.slice(0, Number(f.limit));
        return ok(rows);
      },
      create: (input) => {
        const acc = store.accounts.find((a) => a.id === input.accountId);
        const row: Transaction = {
          id: uuid(),
          accountId: input.accountId!,
          categoryId: input.type === "transfer" ? null : input.categoryId ?? null,
          type: (input.type ?? "expense") as TransactionType,
          transferAccountId: input.type === "transfer" ? input.transferAccountId ?? null : null,
          amount: Math.abs(input.amount ?? 0),
          currency: acc?.currency ?? "IDR",
          date: input.date ?? todayIso(),
          note: input.note ?? "",
          createdAt: new Date().toISOString(),
        };
        store.transactions.push(row);
        save();
        return ok(row);
      },
      update: (id, patch) => {
        const t = store.transactions.find((x) => x.id === id);
        if (t) Object.assign(t, patch, patch.amount != null ? { amount: Math.abs(patch.amount) } : {});
        save();
        return ok(true);
      },
      delete: (id) => {
        store.transactions = store.transactions.filter((t) => t.id !== id);
        save();
        return ok(true);
      },
      bulkDelete: (ids) => {
        store.transactions = store.transactions.filter((t) => !ids.includes(t.id));
        save();
        return ok(true);
      },
    },

    budgets: {
      list: (month) => ok(month ? store.budgets.filter((b) => b.month === month) : store.budgets),
      upsert: (input) => {
        const existing = store.budgets.find((b) => b.categoryId === input.categoryId && b.month === input.month);
        if (existing) {
          existing.amount = input.amount ?? existing.amount;
          existing.currency = input.currency ?? existing.currency;
          save();
          return ok({ id: existing.id });
        }
        const row: Budget = {
          id: uuid(),
          categoryId: input.categoryId!,
          month: input.month!,
          amount: input.amount ?? 0,
          currency: input.currency ?? "IDR",
          createdAt: new Date().toISOString(),
        };
        store.budgets.push(row);
        save();
        return ok(row);
      },
      delete: (id) => {
        store.budgets = store.budgets.filter((b) => b.id !== id);
        save();
        return ok(true);
      },
      actuals: (month) => {
        const map = new Map<string, number>();
        for (const t of store.transactions) {
          if (t.type === "expense" && t.date.slice(0, 7) === month && t.categoryId) {
            map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
          }
        }
        return ok(Array.from(map.entries()).map(([categoryId, spent]) => ({ categoryId, spent })));
      },
    },

    assets: {
      list: () => ok(withAssetAggregates()),
      create: (input) => {
        const now = new Date().toISOString();
        const row = {
          id: uuid(),
          name: input.name ?? "Aset Baru",
          symbol: input.symbol ?? "",
          type: (input.type ?? "stock") as AssetType,
          currency: input.currency ?? "IDR",
          currentPrice: input.currentPrice ?? 0,
          notes: input.notes ?? "",
          excludeFromBalance: input.excludeFromBalance ?? false,
          createdAt: now,
          updatedAt: now,
        };
        store.assets.push(row);
        save();
        return ok(withAssetAggregates().find((a) => a.id === row.id)!);
      },
      update: (id, patch) => {
        const asset = store.assets.find((a) => a.id === id);
        if (asset) Object.assign(asset, patch, { updatedAt: new Date().toISOString() });
        save();
        return ok(true);
      },
      updatePrice: (id, price) => {
        const asset = store.assets.find((a) => a.id === id);
        if (asset) {
          asset.currentPrice = price;
          asset.updatedAt = new Date().toISOString();
        }
        save();
        return ok(true);
      },
      delete: (id) => {
        if (store.holdings.some((h) => h.assetId === id)) {
          return ok({ ok: false, reason: "Aset ini masih punya holding di data demo." });
        }
        store.assets = store.assets.filter((a) => a.id !== id);
        save();
        return ok({ ok: true });
      },
      priceHistory: () => ok([]),
    },

    holdings: {
      create: (input) => {
        const row: Holding = {
          id: uuid(),
          assetId: input.assetId!,
          accountId: input.accountId ?? null,
          quantity: input.quantity ?? 0,
          avgBuyPrice: input.avgBuyPrice ?? 0,
          currency: input.currency ?? "IDR",
          createdAt: new Date().toISOString(),
        };
        store.holdings.push(row);
        if (input.recordFundingTransaction && input.accountId) {
          const acc = store.accounts.find((a) => a.id === input.accountId);
          const asset = store.assets.find((a) => a.id === input.assetId);
          store.transactions.push({
            id: uuid(),
            accountId: input.accountId,
            categoryId: input.fundingCategoryId ?? null,
            type: "expense",
            transferAccountId: null,
            amount: Math.abs((input.quantity ?? 0) * (input.avgBuyPrice ?? 0)),
            currency: acc?.currency ?? "IDR",
            date: input.date ?? todayIso(),
            note: `Pembelian ${asset?.name ?? "aset"} (${input.quantity} unit)`,
            createdAt: new Date().toISOString(),
          });
        }
        save();
        return ok(row);
      },
      update: (id, patch) => {
        const h = store.holdings.find((x) => x.id === id);
        if (h) Object.assign(h, patch);
        save();
        return ok(true);
      },
      delete: (id) => {
        store.holdings = store.holdings.filter((h) => h.id !== id);
        save();
        return ok(true);
      },
    },

    liabilities: {
      list: () => ok(store.liabilities),
      create: (input) => {
        const now = new Date().toISOString();
        const row: Liability = {
          id: uuid(),
          name: input.name ?? "Liabilitas Baru",
          type: (input.type ?? "loan") as LiabilityType,
          balance: input.balance ?? 0,
          currency: input.currency ?? "IDR",
          interestRate: input.interestRate ?? 0,
          dueDate: input.dueDate ?? null,
          notes: input.notes ?? "",
          createdAt: now,
          updatedAt: now,
        };
        store.liabilities.push(row);
        save();
        return ok(row);
      },
      update: (id, patch) => {
        const l = store.liabilities.find((x) => x.id === id);
        if (l) Object.assign(l, patch, { updatedAt: new Date().toISOString() });
        save();
        return ok(true);
      },
      delete: (id) => {
        store.liabilities = store.liabilities.filter((l) => l.id !== id);
        save();
        return ok(true);
      },
    },

    networth: {
      summary: () => ok(computeNetWorthSummary()),
      snapshots: () => ok([...store.netWorthSnapshots].sort((a, b) => (a.date > b.date ? 1 : -1))),
      recordSnapshot: (date) => {
        const summary = computeNetWorthSummary();
        const snapshotDate = date ?? todayIso();
        const existing = store.netWorthSnapshots.find((s) => s.date === snapshotDate);
        if (existing) {
          Object.assign(existing, {
            totalAssets: summary.totalAssets,
            totalLiabilities: summary.totalLiabilities,
            netWorth: summary.netWorth,
            baseCurrency: summary.baseCurrency,
          });
        } else {
          store.netWorthSnapshots.push({
            id: uuid(),
            date: snapshotDate,
            totalAssets: summary.totalAssets,
            totalLiabilities: summary.totalLiabilities,
            netWorth: summary.netWorth,
            baseCurrency: summary.baseCurrency,
            createdAt: new Date().toISOString(),
          });
        }
        save();
        return ok(summary);
      },
    },

    settings: {
      getAll: () => ok({ ...store.settings }),
      set: (key, value) => {
        store.settings[key] = value;
        save();
        return ok(true);
      },
    },

    exchangeRates: {
      list: () => ok(store.exchangeRates),
      upsert: (currency, rate) => {
        const existing = store.exchangeRates.find((r) => r.currency === currency);
        if (existing) existing.rateToBase = rate;
        else store.exchangeRates.push({ id: uuid(), currency, rateToBase: rate, updatedAt: new Date().toISOString() });
        save();
        return ok(true);
      },
      delete: (currency) => {
        store.exchangeRates = store.exchangeRates.filter((r) => r.currency !== currency);
        save();
        return ok(true);
      },
    },

    importCsv: {
      chooseFile: () => {
        window.alert(
          "Impor CSV butuh akses ke sistem file dan hanya tersedia di aplikasi desktop (Electron), bukan di mode pratinjau browser ini."
        );
        return ok(null);
      },
      preview: () => ok({ headers: [], rows: [], totalRows: 0 }),
      commit: () => ok({ imported: 0, skipped: 0, errors: ["Impor CSV tidak tersedia di mode pratinjau browser."] }),
    },

    backup: {
      exportJson: () => {
        try {
          const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `my-networth-demo-backup-${todayIso()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          return ok({ ok: true, filePath: "(diunduh lewat browser)" });
        } catch {
          return ok({ ok: false });
        }
      },
      importJson: () => {
        window.alert("Impor data dari file hanya tersedia di aplikasi desktop.");
        return ok({ ok: false });
      },
      revealDbFile: () => {
        window.alert("Mode pratinjau browser menyimpan data di localStorage, bukan sebagai file di disk.");
        return ok(true);
      },
      dbPath: () => ok("(mode pratinjau browser — data tersimpan di localStorage, bukan file SQLite)"),
    },

    app: {
      getVersion: () => ok("0.1.0 (pratinjau browser)"),
    },
    // Not a real OS platform — there are no native traffic-light buttons to clear in a browser tab.
    platform: "browser",
  };
}

/** Call once, before the React tree mounts, to fall back to the demo API when not running in Electron. */
export function installMockApiIfNeeded() {
  if (typeof window === "undefined") return;
  if (!("api" in window)) {
    (window as unknown as { api: MyNetworthApi }).api = createMockApi();
  }
}
