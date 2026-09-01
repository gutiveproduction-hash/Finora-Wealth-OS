import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import { getDb, getRawSqlite } from "../db";
import { transactions, accounts } from "../db/schema";
import { newId, nowIso } from "../utils/id";

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: "income" | "expense" | "transfer";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
}

export function registerTransactionHandlers() {
  ipcMain.handle("transactions:list", async (_e, filters: TransactionFilters = {}) => {
    const sqlite = getRawSqlite();
    const clauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.accountId) {
      clauses.push("(account_id = @accountId OR transfer_account_id = @accountId)");
      params.accountId = filters.accountId;
    }
    if (filters.categoryId) {
      clauses.push("category_id = @categoryId");
      params.categoryId = filters.categoryId;
    }
    if (filters.type) {
      clauses.push("type = @type");
      params.type = filters.type;
    }
    if (filters.dateFrom) {
      clauses.push("date >= @dateFrom");
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      clauses.push("date <= @dateTo");
      params.dateTo = filters.dateTo;
    }
    if (filters.search) {
      clauses.push("note LIKE @search");
      params.search = `%${filters.search}%`;
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : "";
    const sql = `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC ${limit}`;
    const rows = sqlite.prepare(sql).all(params);
    return rows;
  });

  ipcMain.handle(
    "transactions:create",
    async (
      _e,
      input: {
        accountId: string;
        categoryId?: string | null;
        type: "income" | "expense" | "transfer";
        transferAccountId?: string | null;
        amount: number;
        date: string;
        note?: string;
      }
    ) => {
      const db = getDb();
      const account = (await db.select().from(accounts).where(eq(accounts.id, input.accountId)))[0];
      if (!account) throw new Error("Akun tidak ditemukan");

      const row = {
        id: newId(),
        accountId: input.accountId,
        categoryId: input.type === "transfer" ? null : input.categoryId ?? null,
        type: input.type,
        transferAccountId: input.type === "transfer" ? input.transferAccountId ?? null : null,
        amount: Math.abs(input.amount),
        currency: account.currency,
        date: input.date,
        note: input.note ?? "",
        createdAt: nowIso(),
      };
      await db.insert(transactions).values(row);
      return row;
    }
  );

  ipcMain.handle("transactions:update", async (_e, id: string, patch: Partial<typeof transactions.$inferInsert>) => {
    const db = getDb();
    if (typeof patch.amount === "number") patch.amount = Math.abs(patch.amount);
    await db.update(transactions).set(patch).where(eq(transactions.id, id));
    return true;
  });

  ipcMain.handle("transactions:delete", async (_e, id: string) => {
    const db = getDb();
    await db.delete(transactions).where(eq(transactions.id, id));
    return true;
  });

  ipcMain.handle("transactions:bulkDelete", async (_e, ids: string[]) => {
    const sqlite = getRawSqlite();
    const stmt = sqlite.prepare("DELETE FROM transactions WHERE id = ?");
    const runMany = sqlite.transaction((allIds: string[]) => {
      for (const id of allIds) stmt.run(id);
    });
    runMany(ids);
    return true;
  });
}
