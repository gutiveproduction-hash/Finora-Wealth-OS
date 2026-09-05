import { ipcMain } from "electron";
import { getDb, getRawSqlite } from "../db";
import { netWorthSnapshots } from "../db/schema";
import { newId, nowIso } from "../utils/id";
import { getRatesMap, getBaseCurrency, toBase } from "../utils/currency";
import { computeAccountBalance } from "./accounts";

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

/** Computes current net worth from live data (accounts + holdings - liabilities), converted to base currency. */
export function computeNetWorthSummary(): NetWorthSummary {
  const sqlite = getRawSqlite();
  const rates = getRatesMap();
  const baseCurrency = getBaseCurrency();

  const accountRows = sqlite.prepare("SELECT id, currency FROM accounts WHERE archived = 0").all() as Array<{
    id: string;
    currency: string;
  }>;
  let cashTotal = 0;
  for (const a of accountRows) {
    const balance = computeAccountBalance(a.id);
    cashTotal += toBase(balance, a.currency, rates);
  }

  const holdingRows = sqlite
    .prepare(
      `SELECT h.quantity as quantity, a.current_price as currentPrice, a.currency as currency
       FROM holdings h JOIN assets a ON a.id = h.asset_id
       WHERE a.exclude_from_balance = 0`
    )
    .all() as Array<{ quantity: number; currentPrice: number; currency: string }>;
  let investmentsTotal = 0;
  for (const h of holdingRows) {
    investmentsTotal += toBase(h.quantity * h.currentPrice, h.currency, rates);
  }

  const liabilityRows = sqlite.prepare("SELECT balance, currency FROM liabilities").all() as Array<{
    balance: number;
    currency: string;
  }>;
  let liabilitiesTotal = 0;
  for (const l of liabilityRows) {
    liabilitiesTotal += toBase(l.balance, l.currency, rates);
  }

  const totalAssets = cashTotal + investmentsTotal;
  return {
    totalAssets,
    totalLiabilities: liabilitiesTotal,
    netWorth: totalAssets - liabilitiesTotal,
    baseCurrency,
    breakdown: { cashAccounts: cashTotal, investments: investmentsTotal },
  };
}

export function registerNetWorthHandlers() {
  ipcMain.handle("networth:summary", async () => computeNetWorthSummary());

  ipcMain.handle("networth:snapshots", async () => {
    const db = getDb();
    return db.select().from(netWorthSnapshots).orderBy(netWorthSnapshots.date);
  });

  /** Records (or overwrites, if one already exists for today) a snapshot of current net worth. */
  ipcMain.handle("networth:recordSnapshot", async (_e, date?: string) => {
    const summary = computeNetWorthSummary();
    const sqlite = getRawSqlite();
    const snapshotDate = date ?? new Date().toISOString().slice(0, 10);
    sqlite
      .prepare(
        `INSERT INTO net_worth_snapshots (id, date, total_assets, total_liabilities, net_worth, base_currency, created_at)
         VALUES (@id, @date, @totalAssets, @totalLiabilities, @netWorth, @baseCurrency, @createdAt)
         ON CONFLICT(date) DO UPDATE SET
           total_assets = excluded.total_assets,
           total_liabilities = excluded.total_liabilities,
           net_worth = excluded.net_worth,
           base_currency = excluded.base_currency`
      )
      .run({
        id: newId(),
        date: snapshotDate,
        totalAssets: summary.totalAssets,
        totalLiabilities: summary.totalLiabilities,
        netWorth: summary.netWorth,
        baseCurrency: summary.baseCurrency,
        createdAt: nowIso(),
      });
    return summary;
  });
}
