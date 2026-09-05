import { sqliteTable, text, real, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Finora database schema (SQLite via drizzle-orm).
 *
 * Design notes:
 * - Every table uses a TEXT uuid primary key (generated in app code) rather than
 *   autoincrement integers, so records are stable across import/export/merge.
 * - Money is stored as REAL in the record's own `currency`. Aggregation across
 *   currencies happens in application code using the `exchangeRates` table
 *   (see electron/utils/currency.ts), converting everything to the user's base
 *   currency (default IDR) at render/report time.
 * - This app is offline-first: there is no server, no auth, no telemetry. The
 *   sqlite file lives entirely on the user's machine (see electron/db/index.ts
 *   for its on-disk location).
 */

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["bank", "ewallet", "cash", "investment", "other"] }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  initialBalance: real("initial_balance").notNull().default(0),
  color: text("color").notNull().default("#22a76d"),
  icon: text("icon").notNull().default("wallet"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  color: text("color").notNull().default("#64748b"),
  icon: text("icon").notNull().default("tag"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  categoryId: text("category_id"),
  type: text("type", { enum: ["income", "expense", "transfer"] }).notNull(),
  transferAccountId: text("transfer_account_id"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("IDR"),
  date: text("date").notNull(),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const budgets = sqliteTable(
  "budgets",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id").notNull(),
    month: text("month").notNull(), // "YYYY-MM"
    amount: real("amount").notNull(),
    currency: text("currency").notNull().default("IDR"),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    categoryMonthUnique: uniqueIndex("budgets_category_month_unique").on(t.categoryId, t.month),
  })
);

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull().default(""),
  type: text("type", { enum: ["stock", "mutual_fund", "crypto", "bond", "property", "other"] }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  currentPrice: real("current_price").notNull().default(0),
  notes: text("notes").notNull().default(""),
  excludeFromBalance: integer("exclude_from_balance", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const holdings = sqliteTable("holdings", {
  id: text("id").primaryKey(),
  assetId: text("asset_id").notNull(),
  accountId: text("account_id"),
  quantity: real("quantity").notNull().default(0),
  avgBuyPrice: real("avg_buy_price").notNull().default(0),
  currency: text("currency").notNull().default("IDR"),
  createdAt: text("created_at").notNull(),
});

export const priceHistory = sqliteTable(
  "price_history",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id").notNull(),
    date: text("date").notNull(), // "YYYY-MM-DD"
    price: real("price").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    assetDateUnique: uniqueIndex("price_history_asset_date_unique").on(t.assetId, t.date),
  })
);

export const liabilities = sqliteTable("liabilities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["loan", "credit_card", "mortgage", "other"] }).notNull(),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("IDR"),
  interestRate: real("interest_rate").notNull().default(0),
  dueDate: text("due_date"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const netWorthSnapshots = sqliteTable(
  "net_worth_snapshots",
  {
    id: text("id").primaryKey(),
    date: text("date").notNull(), // "YYYY-MM-DD"
    totalAssets: real("total_assets").notNull(),
    totalLiabilities: real("total_liabilities").notNull(),
    netWorth: real("net_worth").notNull(),
    baseCurrency: text("base_currency").notNull().default("IDR"),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    dateUnique: uniqueIndex("net_worth_snapshots_date_unique").on(t.date),
  })
);

export const exchangeRates = sqliteTable(
  "exchange_rates",
  {
    id: text("id").primaryKey(),
    currency: text("currency").notNull(),
    rateToBase: real("rate_to_base").notNull(), // 1 unit of `currency` = rateToBase * base currency
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    currencyUnique: uniqueIndex("exchange_rates_currency_unique").on(t.currency),
  })
);
