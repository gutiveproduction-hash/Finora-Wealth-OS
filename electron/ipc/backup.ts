import { ipcMain, dialog, shell, BrowserWindow, app } from "electron";
import fs from "node:fs";
import { getRawSqlite, getDbPath } from "../db";

const TABLES = [
  "settings",
  "accounts",
  "categories",
  "transactions",
  "budgets",
  "assets",
  "holdings",
  "price_history",
  "liabilities",
  "net_worth_snapshots",
  "exchange_rates",
];

export function registerBackupHandlers() {
  ipcMain.handle("backup:exportJson", async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(win ?? undefined!, {
      title: "Ekspor data Finora",
      defaultPath: `finora-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return { ok: false };

    const sqlite = getRawSqlite();
    const dump: Record<string, unknown[]> = { _meta: [{ exportedAt: new Date().toISOString(), app: "finora", version: 1 }] as unknown[] };
    for (const table of TABLES) {
      dump[table] = sqlite.prepare(`SELECT * FROM ${table}`).all();
    }
    fs.writeFileSync(result.filePath, JSON.stringify(dump, null, 2), "utf-8");
    return { ok: true, filePath: result.filePath };
  });

  ipcMain.handle("backup:importJson", async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win ?? undefined!, {
      title: "Impor data Finora (akan menimpa data saat ini)",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || result.filePaths.length === 0) return { ok: false };

    let data: Record<string, Array<Record<string, unknown>>>;
    try {
      data = JSON.parse(fs.readFileSync(result.filePaths[0], "utf-8"));
    } catch {
      return { ok: false, reason: "File tidak bisa dibaca sebagai JSON." };
    }

    // Impor menghapus SEMUA tabel sebelum menulis ulang. Tanpa validasi ini, memilih file
    // JSON yang salah akan mengosongkan seluruh database tanpa peringatan apa pun.
    const meta = Array.isArray(data?._meta) ? (data._meta[0] as { app?: string } | undefined) : undefined;
    if (meta?.app !== "finora") {
      return { ok: false, reason: "File ini bukan hasil ekspor Finora — impor dibatalkan agar data Anda tidak terhapus." };
    }
    if (!TABLES.some((table) => Array.isArray(data[table]) && data[table].length > 0)) {
      return { ok: false, reason: "File backup kosong — impor dibatalkan agar data Anda tidak terhapus." };
    }

    const sqlite = getRawSqlite();

    const run = sqlite.transaction(() => {
      for (const table of TABLES) {
        sqlite.prepare(`DELETE FROM ${table}`).run();
        const rows = data[table] ?? [];
        if (rows.length === 0) continue;
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((c) => `@${c}`).join(", ");
        const stmt = sqlite.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`);
        for (const row of rows) stmt.run(row);
      }
    });
    try {
      run();
    } catch (err) {
      // Transaksi SQLite otomatis rollback, jadi data lama tetap utuh.
      return { ok: false, reason: `Struktur file backup tidak cocok: ${(err as Error).message}` };
    }

    return { ok: true };
  });

  ipcMain.handle("backup:revealDbFile", async () => {
    shell.showItemInFolder(getDbPath());
    return true;
  });

  ipcMain.handle("backup:dbPath", async () => getDbPath());

  ipcMain.handle("app:getVersion", async () => app.getVersion());
}
