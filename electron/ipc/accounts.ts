import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import { getDb, getRawSqlite } from "../db";
import { accounts, transactions } from "../db/schema";
import { newId, nowIso } from "../utils/id";

export interface AccountBalance {
  accountId: string;
  balance: number;
}

/** Computes the ledger balance for a single account: initialBalance + net of its transactions. */
export function computeAccountBalance(accountId: string): number {
  const sqlite = getRawSqlite();
  const acc = sqlite.prepare("SELECT initial_balance as initialBalance FROM accounts WHERE id = ?").get(accountId) as
    | { initialBalance: number }
    | undefined;
  if (!acc) return 0;

  const outgoing = sqlite
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE account_id = ? AND type IN ('expense', 'transfer')`
    )
    .get(accountId) as { total: number };

  const incoming = sqlite
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE (account_id = ? AND type = 'income')
          OR (transfer_account_id = ? AND type = 'transfer')`
    )
    .get(accountId, accountId) as { total: number };

  return acc.initialBalance + incoming.total - outgoing.total;
}

export function registerAccountHandlers() {
  ipcMain.handle("accounts:list", async () => {
    const db = getDb();
    const rows = await db.select().from(accounts);
    return rows.map((a) => ({ ...a, balance: computeAccountBalance(a.id) }));
  });

  ipcMain.handle("accounts:create", async (_e, input: {
    name: string;
    type: "bank" | "ewallet" | "cash" | "investment" | "other";
    currency: string;
    initialBalance: number;
    color?: string;
    icon?: string;
  }) => {
    const db = getDb();
    const row = {
      id: newId(),
      name: input.name,
      type: input.type,
      currency: input.currency || "IDR",
      initialBalance: input.initialBalance ?? 0,
      color: input.color ?? "#22a76d",
      icon: input.icon ?? "wallet",
      archived: false,
      createdAt: nowIso(),
    };
    await db.insert(accounts).values(row);
    return row;
  });

  ipcMain.handle("accounts:update", async (_e, id: string, patch: Partial<typeof accounts.$inferInsert>) => {
    const db = getDb();
    await db.update(accounts).set(patch).where(eq(accounts.id, id));
    return true;
  });

  ipcMain.handle("accounts:delete", async (_e, id: string) => {
    const db = getDb();
    // Guard: don't silently orphan transactions/holdings tied to this account.
    const sqlite = getRawSqlite();
    const txCount = sqlite
      .prepare("SELECT COUNT(*) as c FROM transactions WHERE account_id = ? OR transfer_account_id = ?")
      .get(id, id) as { c: number };
    const holdingCount = sqlite.prepare("SELECT COUNT(*) as c FROM holdings WHERE account_id = ?").get(id) as {
      c: number;
    };
    if (txCount.c > 0 || holdingCount.c > 0) {
      return {
        ok: false,
        reason: `Akun ini masih punya ${txCount.c} transaksi dan ${holdingCount.c} holding terkait. Hapus atau pindahkan dulu sebelum menghapus akun.`,
      };
    }
    await db.delete(accounts).where(eq(accounts.id, id));
    return { ok: true };
  });
}
