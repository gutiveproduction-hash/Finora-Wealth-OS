import { ipcMain } from "electron";
import { eq, desc } from "drizzle-orm";
import { getDb, getRawSqlite } from "../db";
import { budgets } from "../db/schema";
import { newId, nowIso } from "../utils/id";

export function registerBudgetHandlers() {
  ipcMain.handle("budgets:list", async (_e, month?: string) => {
    const db = getDb();
    if (month) {
      return db.select().from(budgets).where(eq(budgets.month, month));
    }
    return db.select().from(budgets).orderBy(desc(budgets.month));
  });

  /** Creates or updates the budget for a category+month in one call (upsert on the unique index). */
  ipcMain.handle(
    "budgets:upsert",
    async (_e, input: { categoryId: string; month: string; amount: number; currency?: string }) => {
      const sqlite = getRawSqlite();
      const existing = sqlite
        .prepare("SELECT id FROM budgets WHERE category_id = ? AND month = ?")
        .get(input.categoryId, input.month) as { id: string } | undefined;

      if (existing) {
        const db = getDb();
        await db
          .update(budgets)
          .set({ amount: input.amount, currency: input.currency ?? "IDR" })
          .where(eq(budgets.id, existing.id));
        return { id: existing.id };
      }
      const db = getDb();
      const row = {
        id: newId(),
        categoryId: input.categoryId,
        month: input.month,
        amount: input.amount,
        currency: input.currency ?? "IDR",
        createdAt: nowIso(),
      };
      await db.insert(budgets).values(row);
      return row;
    }
  );

  ipcMain.handle("budgets:delete", async (_e, id: string) => {
    const db = getDb();
    await db.delete(budgets).where(eq(budgets.id, id));
    return true;
  });

  /** For a given month, returns spend-per-category so the UI can render budget vs. actual. */
  ipcMain.handle("budgets:actuals", async (_e, month: string) => {
    const sqlite = getRawSqlite();
    return sqlite
      .prepare(
        `SELECT category_id as categoryId, COALESCE(SUM(amount), 0) as spent
         FROM transactions
         WHERE type = 'expense' AND substr(date, 1, 7) = ?
         GROUP BY category_id`
      )
      .all(month);
  });
}
