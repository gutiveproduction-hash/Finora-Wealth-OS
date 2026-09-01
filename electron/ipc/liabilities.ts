import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { liabilities } from "../db/schema";
import { newId, nowIso } from "../utils/id";

export function registerLiabilityHandlers() {
  ipcMain.handle("liabilities:list", async () => {
    const db = getDb();
    return db.select().from(liabilities);
  });

  ipcMain.handle(
    "liabilities:create",
    async (
      _e,
      input: {
        name: string;
        type: "loan" | "credit_card" | "mortgage" | "other";
        balance: number;
        currency: string;
        interestRate?: number;
        dueDate?: string | null;
        notes?: string;
      }
    ) => {
      const db = getDb();
      const now = nowIso();
      const row = {
        id: newId(),
        name: input.name,
        type: input.type,
        balance: input.balance ?? 0,
        currency: input.currency || "IDR",
        interestRate: input.interestRate ?? 0,
        dueDate: input.dueDate ?? null,
        notes: input.notes ?? "",
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(liabilities).values(row);
      return row;
    }
  );

  ipcMain.handle("liabilities:update", async (_e, id: string, patch: Partial<typeof liabilities.$inferInsert>) => {
    const db = getDb();
    await db.update(liabilities).set({ ...patch, updatedAt: nowIso() }).where(eq(liabilities.id, id));
    return true;
  });

  ipcMain.handle("liabilities:delete", async (_e, id: string) => {
    const db = getDb();
    await db.delete(liabilities).where(eq(liabilities.id, id));
    return true;
  });
}
