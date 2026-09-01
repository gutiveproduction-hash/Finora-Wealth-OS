import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import { getDb, getRawSqlite } from "../db";
import { categories } from "../db/schema";
import { newId, nowIso } from "../utils/id";

export function registerCategoryHandlers() {
  ipcMain.handle("categories:list", async () => {
    const db = getDb();
    return db.select().from(categories);
  });

  ipcMain.handle("categories:create", async (_e, input: { name: string; type: "income" | "expense"; color?: string; icon?: string }) => {
    const db = getDb();
    const row = {
      id: newId(),
      name: input.name,
      type: input.type,
      color: input.color ?? "#64748b",
      icon: input.icon ?? "tag",
      isDefault: false,
      createdAt: nowIso(),
    };
    await db.insert(categories).values(row);
    return row;
  });

  ipcMain.handle("categories:update", async (_e, id: string, patch: Partial<typeof categories.$inferInsert>) => {
    const db = getDb();
    await db.update(categories).set(patch).where(eq(categories.id, id));
    return true;
  });

  ipcMain.handle("categories:delete", async (_e, id: string) => {
    const db = getDb();
    const sqlite = getRawSqlite();
    const used = sqlite.prepare("SELECT COUNT(*) as c FROM transactions WHERE category_id = ?").get(id) as {
      c: number;
    };
    if (used.c > 0) {
      return { ok: false, reason: `Kategori ini dipakai di ${used.c} transaksi. Ubah transaksi tersebut dulu.` };
    }
    await db.delete(categories).where(eq(categories.id, id));
    return { ok: true };
  });
}
