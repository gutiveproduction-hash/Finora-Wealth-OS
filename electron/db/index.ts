import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { app } from "electron";
import * as schema from "./schema";

/**
 * Where the sqlite file lives on disk:
 *   macOS:   ~/Library/Application Support/My Networth/my-networth.sqlite3
 *   Windows: %APPDATA%/My Networth/my-networth.sqlite3
 *   Linux:   ~/.config/My Networth/my-networth.sqlite3
 * `app.getPath("userData")` resolves all three automatically. In non-electron
 * contexts (e.g. tests) MY_NETWORTH_DB_PATH can override this.
 */
export function getDbPath(): string {
  if (process.env.MY_NETWORTH_DB_PATH) return process.env.MY_NETWORTH_DB_PATH;
  const dir = app.getPath("userData");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "my-networth.sqlite3");
}

let sqlite: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  initial_balance REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#22a76d',
  icon TEXT NOT NULL DEFAULT 'wallet',
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748b',
  icon TEXT NOT NULL DEFAULT 'tag',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL,
  category_id TEXT,
  type TEXT NOT NULL,
  transfer_account_id TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  date TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS transactions_account_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL,
  month TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS budgets_category_month_unique ON budgets(category_id, month);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  current_price REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY NOT NULL,
  asset_id TEXT NOT NULL,
  account_id TEXT,
  quantity REAL NOT NULL DEFAULT 0,
  avg_buy_price REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS holdings_asset_idx ON holdings(asset_id);

CREATE TABLE IF NOT EXISTS price_history (
  id TEXT PRIMARY KEY NOT NULL,
  asset_id TEXT NOT NULL,
  date TEXT NOT NULL,
  price REAL NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS price_history_asset_date_unique ON price_history(asset_id, date);

CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  interest_rate REAL NOT NULL DEFAULT 0,
  due_date TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  total_assets REAL NOT NULL,
  total_liabilities REAL NOT NULL,
  net_worth REAL NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS net_worth_snapshots_date_unique ON net_worth_snapshots(date);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id TEXT PRIMARY KEY NOT NULL,
  currency TEXT NOT NULL,
  rate_to_base REAL NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS exchange_rates_currency_unique ON exchange_rates(currency);
`;

function seedDefaults(sqliteDb: Database.Database) {
  const now = new Date().toISOString();

  const settingsCount = sqliteDb.prepare("SELECT COUNT(*) as c FROM settings").get() as { c: number };
  if (settingsCount.c === 0) {
    const insertSetting = sqliteDb.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    insertSetting.run("baseCurrency", "IDR");
    insertSetting.run("theme", "system");
    insertSetting.run("schemaVersion", "1");
  }

  const categoryCount = sqliteDb.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
  if (categoryCount.c === 0) {
    const insertCategory = sqliteDb.prepare(
      "INSERT INTO categories (id, name, type, color, icon, is_default, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)"
    );
    const defaultCategories: Array<[string, "income" | "expense", string, string]> = [
      ["Gaji", "income", "#22a76d", "banknote"],
      ["Bonus & THR", "income", "#16a34a", "gift"],
      ["Investasi Masuk", "income", "#0891b2", "trending-up"],
      ["Lainnya (Pemasukan)", "income", "#64748b", "plus-circle"],
      ["Makanan & Minuman", "expense", "#f97316", "utensils"],
      ["Transportasi", "expense", "#3b82f6", "car"],
      ["Belanja", "expense", "#ec4899", "shopping-bag"],
      ["Tagihan & Utilitas", "expense", "#eab308", "receipt"],
      ["Kesehatan", "expense", "#ef4444", "heart-pulse"],
      ["Hiburan", "expense", "#8b5cf6", "clapperboard"],
      ["Pendidikan", "expense", "#06b6d4", "graduation-cap"],
      ["Cicilan & Utang", "expense", "#dc2626", "landmark"],
      ["Lainnya (Pengeluaran)", "expense", "#64748b", "minus-circle"],
    ];
    for (const [name, type, color, icon] of defaultCategories) {
      insertCategory.run(randomUUID(), name, type, color, icon, now);
    }
  }

  const rateCount = sqliteDb.prepare("SELECT COUNT(*) as c FROM exchange_rates").get() as { c: number };
  if (rateCount.c === 0) {
    const insertRate = sqliteDb.prepare(
      "INSERT INTO exchange_rates (id, currency, rate_to_base, updated_at) VALUES (?, ?, ?, ?)"
    );
    // Seed values only — approximate order of magnitude. The user should update
    // these in Settings to reflect the current exchange rate, since this app has
    // no network access / live price feed by design (fully offline, local-only).
    const seedRates: Array<[string, number]> = [
      ["IDR", 1],
      ["USD", 16000],
      ["EUR", 17300],
      ["SGD", 11900],
      ["JPY", 107],
      ["GBP", 20200],
      ["AUD", 10500],
      ["MYR", 3600],
    ];
    for (const [currency, rate] of seedRates) {
      insertRate.run(randomUUID(), currency, rate, now);
    }
  }
}

export function getDb() {
  if (dbInstance) return dbInstance;
  const dbPath = getDbPath();
  sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(SCHEMA_SQL);
  seedDefaults(sqlite);
  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export function getRawSqlite(): Database.Database {
  if (!sqlite) getDb();
  return sqlite!;
}

export function closeDb() {
  sqlite?.close();
  sqlite = null;
  dbInstance = null;
}
