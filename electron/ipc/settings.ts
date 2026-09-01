import { ipcMain } from "electron";
import { getDb, getRawSqlite } from "../db";
import { settings, exchangeRates } from "../db/schema";
import { eq } from "drizzle-orm";
import { newId, nowIso } from "../utils/id";

export function registerSettingsHandlers() {
  ipcMain.handle("settings:getAll", async () => {
    const sqlite = getRawSqlite();
    const rows = sqlite.prepare("SELECT key, value FROM settings").all() as Array<{ key: string; value: string }>;
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  });

  ipcMain.handle("settings:set", async (_e, key: string, value: string) => {
    const sqlite = getRawSqlite();
    sqlite
      .prepare(
        `INSERT INTO settings (key, value) VALUES (@key, @value)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .run({ key, value });
    return true;
  });

  ipcMain.handle("exchangeRates:list", async () => {
    const db = getDb();
    return db.select().from(exchangeRates);
  });

  ipcMain.handle("exchangeRates:upsert", async (_e, currency: string, rateToBase: number) => {
    const sqlite = getRawSqlite();
    sqlite
      .prepare(
        `INSERT INTO exchange_rates (id, currency, rate_to_base, updated_at) VALUES (@id, @currency, @rate, @updatedAt)
         ON CONFLICT(currency) DO UPDATE SET rate_to_base = excluded.rate_to_base, updated_at = excluded.updated_at`
      )
      .run({ id: newId(), currency, rate: rateToBase, updatedAt: nowIso() });
    return true;
  });

  ipcMain.handle("exchangeRates:delete", async (_e, currency: string) => {
    const db = getDb();
    await db.delete(exchangeRates).where(eq(exchangeRates.currency, currency));
    return true;
  });
}
