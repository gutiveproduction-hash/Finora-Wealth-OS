import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import { getDb, getRawSqlite } from "../db";
import { assets, holdings, transactions } from "../db/schema";
import { newId, nowIso } from "../utils/id";

export function registerInvestmentHandlers() {
  // ---- Assets -------------------------------------------------------------
  ipcMain.handle("assets:list", async () => {
    const db = getDb();
    const rows = await db.select().from(assets).orderBy(assets.name);
    const holdingRows = await db.select().from(holdings);

    return rows.map((asset) => {
      const assetHoldings = holdingRows.filter((h) => h.assetId === asset.id);
      const totalQty = assetHoldings.reduce((s, h) => s + h.quantity, 0);
      const totalCost = assetHoldings.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0);
      const avgBuyPrice = totalQty > 0 ? totalCost / totalQty : 0;
      const marketValue = totalQty * asset.currentPrice;
      const gain = marketValue - totalCost;
      const gainPct = totalCost > 0 ? (gain / totalCost) * 100 : 0;
      return { ...asset, totalQty, totalCost, avgBuyPrice, marketValue, gain, gainPct, holdings: assetHoldings };
    });
  });

  ipcMain.handle(
    "assets:create",
    async (
      _e,
      input: {
        name: string;
        symbol?: string;
        type: "stock" | "mutual_fund" | "crypto" | "bond" | "property" | "other";
        currency: string;
        currentPrice: number;
        notes?: string;
      }
    ) => {
      const db = getDb();
      const now = nowIso();
      const row = {
        id: newId(),
        name: input.name,
        symbol: input.symbol ?? "",
        type: input.type,
        currency: input.currency || "IDR",
        currentPrice: input.currentPrice ?? 0,
        notes: input.notes ?? "",
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(assets).values(row);
      return row;
    }
  );

  ipcMain.handle("assets:update", async (_e, id: string, patch: Partial<typeof assets.$inferInsert>) => {
    const db = getDb();
    await db.update(assets).set({ ...patch, updatedAt: nowIso() }).where(eq(assets.id, id));
    return true;
  });

  ipcMain.handle("assets:updatePrice", async (_e, id: string, price: number, date?: string) => {
    const db = getDb();
    const sqlite = getRawSqlite();
    await db.update(assets).set({ currentPrice: price, updatedAt: nowIso() }).where(eq(assets.id, id));
    const historyDate = date ?? new Date().toISOString().slice(0, 10);
    sqlite
      .prepare(
        `INSERT INTO price_history (id, asset_id, date, price, created_at)
         VALUES (@id, @assetId, @date, @price, @createdAt)
         ON CONFLICT(asset_id, date) DO UPDATE SET price = excluded.price`
      )
      .run({ id: newId(), assetId: id, date: historyDate, price, createdAt: nowIso() });
    return true;
  });

  ipcMain.handle("assets:delete", async (_e, id: string) => {
    const sqlite = getRawSqlite();
    const holdingCount = sqlite.prepare("SELECT COUNT(*) as c FROM holdings WHERE asset_id = ?").get(id) as {
      c: number;
    };
    if (holdingCount.c > 0) {
      return { ok: false, reason: `Aset ini masih punya ${holdingCount.c} holding. Hapus holding-nya dulu.` };
    }
    const db = getDb();
    await db.delete(assets).where(eq(assets.id, id));
    sqlite.prepare("DELETE FROM price_history WHERE asset_id = ?").run(id);
    return { ok: true };
  });

  ipcMain.handle("assets:priceHistory", async (_e, assetId: string) => {
    const sqlite = getRawSqlite();
    return sqlite.prepare("SELECT * FROM price_history WHERE asset_id = ? ORDER BY date ASC").all(assetId);
  });

  // ---- Holdings -------------------------------------------------------------
  ipcMain.handle(
    "holdings:create",
    async (
      _e,
      input: {
        assetId: string;
        accountId?: string | null;
        quantity: number;
        avgBuyPrice: number;
        currency: string;
        recordFundingTransaction?: boolean;
        fundingCategoryId?: string | null;
        date?: string;
      }
    ) => {
      const db = getDb();
      const row = {
        id: newId(),
        assetId: input.assetId,
        accountId: input.accountId ?? null,
        quantity: input.quantity,
        avgBuyPrice: input.avgBuyPrice,
        currency: input.currency || "IDR",
        createdAt: nowIso(),
      };
      await db.insert(holdings).values(row);

      if (input.recordFundingTransaction && input.accountId) {
        const asset = (await db.select().from(assets).where(eq(assets.id, input.assetId)))[0];
        await db.insert(transactions).values({
          id: newId(),
          accountId: input.accountId,
          categoryId: input.fundingCategoryId ?? null,
          type: "expense",
          transferAccountId: null,
          amount: Math.abs(input.quantity * input.avgBuyPrice),
          currency: input.currency || "IDR",
          date: input.date ?? new Date().toISOString().slice(0, 10),
          note: `Pembelian ${asset?.name ?? "aset"} (${input.quantity} unit)`,
          createdAt: nowIso(),
        });
      }
      return row;
    }
  );

  ipcMain.handle("holdings:update", async (_e, id: string, patch: Partial<typeof holdings.$inferInsert>) => {
    const db = getDb();
    await db.update(holdings).set(patch).where(eq(holdings.id, id));
    return true;
  });

  ipcMain.handle("holdings:delete", async (_e, id: string) => {
    const db = getDb();
    await db.delete(holdings).where(eq(holdings.id, id));
    return true;
  });
}
