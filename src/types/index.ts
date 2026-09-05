export type AccountType = "bank" | "ewallet" | "cash" | "investment" | "other";
export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";
export type AssetType = "stock" | "mutual_fund" | "crypto" | "bond" | "property" | "other";
export type LiabilityType = "loan" | "credit_card" | "mortgage" | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  color: string;
  icon: string;
  archived: boolean;
  createdAt: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  transferAccountId: string | null;
  amount: number;
  currency: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface Holding {
  id: string;
  assetId: string;
  accountId: string | null;
  quantity: number;
  avgBuyPrice: number;
  currency: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  currency: string;
  currentPrice: number;
  notes: string;
  excludeFromBalance: boolean;
  createdAt: string;
  updatedAt: string;
  totalQty: number;
  totalCost: number;
  avgBuyPrice: number;
  marketValue: number;
  gain: number;
  gainPct: number;
  holdings: Holding[];
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  currency: string;
  interestRate: number;
  dueDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  baseCurrency: string;
  breakdown: {
    cashAccounts: number;
    investments: number;
  };
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  baseCurrency: string;
  createdAt: string;
}

export interface ExchangeRate {
  id: string;
  currency: string;
  rateToBase: number;
  updatedAt: string;
}

export interface CsvColumnMapping {
  date: string;
  amount: string;
  note?: string;
  type?: string;
  signedAmount?: boolean;
}

/** Mirrors the surface exposed by electron/preload.ts via contextBridge. */
export interface MyNetworthApi {
  accounts: {
    list: () => Promise<Account[]>;
    create: (input: Partial<Account>) => Promise<Account>;
    update: (id: string, patch: Partial<Account>) => Promise<boolean>;
    delete: (id: string) => Promise<{ ok: boolean; reason?: string }>;
  };
  categories: {
    list: () => Promise<Category[]>;
    create: (input: Partial<Category>) => Promise<Category>;
    update: (id: string, patch: Partial<Category>) => Promise<boolean>;
    delete: (id: string) => Promise<{ ok: boolean; reason?: string }>;
  };
  transactions: {
    list: (filters?: Record<string, unknown>) => Promise<Transaction[]>;
    create: (input: Partial<Transaction>) => Promise<Transaction>;
    update: (id: string, patch: Partial<Transaction>) => Promise<boolean>;
    delete: (id: string) => Promise<boolean>;
    bulkDelete: (ids: string[]) => Promise<boolean>;
  };
  budgets: {
    list: (month?: string) => Promise<Budget[]>;
    upsert: (input: Partial<Budget>) => Promise<Budget | { id: string }>;
    delete: (id: string) => Promise<boolean>;
    actuals: (month: string) => Promise<Array<{ categoryId: string; spent: number }>>;
  };
  assets: {
    list: () => Promise<Asset[]>;
    create: (input: Partial<Asset>) => Promise<Asset>;
    update: (id: string, patch: Partial<Asset>) => Promise<boolean>;
    updatePrice: (id: string, price: number, date?: string) => Promise<boolean>;
    delete: (id: string) => Promise<{ ok: boolean; reason?: string }>;
    priceHistory: (assetId: string) => Promise<Array<{ date: string; price: number }>>;
  };
  holdings: {
    create: (input: Partial<Holding> & { recordFundingTransaction?: boolean; fundingCategoryId?: string | null; date?: string }) => Promise<Holding>;
    update: (id: string, patch: Partial<Holding>) => Promise<boolean>;
    delete: (id: string) => Promise<boolean>;
  };
  liabilities: {
    list: () => Promise<Liability[]>;
    create: (input: Partial<Liability>) => Promise<Liability>;
    update: (id: string, patch: Partial<Liability>) => Promise<boolean>;
    delete: (id: string) => Promise<boolean>;
  };
  networth: {
    summary: () => Promise<NetWorthSummary>;
    snapshots: () => Promise<NetWorthSnapshot[]>;
    recordSnapshot: (date?: string) => Promise<NetWorthSummary>;
  };
  settings: {
    getAll: () => Promise<Record<string, string>>;
    set: (key: string, value: string) => Promise<boolean>;
  };
  exchangeRates: {
    list: () => Promise<ExchangeRate[]>;
    upsert: (currency: string, rate: number) => Promise<boolean>;
    delete: (currency: string) => Promise<boolean>;
  };
  importCsv: {
    chooseFile: () => Promise<string | null>;
    preview: (filePath: string) => Promise<{ headers: string[]; rows: Record<string, string>[]; totalRows: number }>;
    commit: (options: {
      filePath: string;
      accountId: string;
      categoryId?: string | null;
      mapping: CsvColumnMapping;
      dayFirst?: boolean;
    }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  };
  backup: {
    exportJson: () => Promise<{ ok: boolean; filePath?: string }>;
    importJson: () => Promise<{ ok: boolean }>;
    revealDbFile: () => Promise<boolean>;
    dbPath: () => Promise<string>;
  };
  app: {
    getVersion: () => Promise<string>;
  };
  /** Real OS platform ("darwin"/"win32"/"linux") in Electron, or "browser" in the preview fallback. */
  platform: string;
}

declare global {
  interface Window {
    api: MyNetworthApi;
  }
}
