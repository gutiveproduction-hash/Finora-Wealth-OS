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
      title: "Ekspor data My Networth",
      defaultPath: `my-networth-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return { ok: false };

    const sqlite = getRawSqlite();
    const dump: Record<string, unknown[]> = { _meta: [{ exportedAt: new Date().toISOString(), app: "my-networth", version: 1 }] as unknown[] };
    for (const table of TABLES) {
      dump[table] = sqlite.prepare(`SELECT * FROM ${table}`).all();
    }
    fs.writeFileSync(result.filePath, JSON.stringify(dump, null, 2), "utf-8");
    return { ok: true, filePath: result.filePath };
  });

  ipcMain.handle("backup:importJson", async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win ?? undefined!, {
      title: "Impor data My Networth (akan menimpa data saat ini)",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || result.filePaths.length === 0) return { ok: false };

    const raw = fs.readFileSync(result.filePaths[0], "utf-8");
    const data = JSON.parse(raw) as Record<string, Array<Record<string, unknown>>>;
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
    run();

    return { ok: true };
  });

  ipcMain.handle("backup:revealDbFile", async () => {
    shell.showItemInFolder(getDbPath());
    return true;
  });

  ipcMain.handle("backup:dbPath", async () => getDbPath());

  ipcMain.handle("app:getVersion", async () => app.getVersion());
}
