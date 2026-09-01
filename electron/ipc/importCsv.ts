import { ipcMain, dialog, BrowserWindow } from "electron";
import fs from "node:fs";
import Papa from "papaparse";
import { getDb } from "../db";
import { transactions, accounts } from "../db/schema";
import { newId, nowIso } from "../utils/id";
import { eq } from "drizzle-orm";

export interface CsvColumnMapping {
  date: string;
  amount: string;
  note?: string;
  /** Column holding "income"/"expense", or omitted if `signedAmount` is used. */
  type?: string;
  /** If true, negative amount = expense, positive = income, and `type` column is ignored. */
  signedAmount?: boolean;
}

export interface CsvImportOptions {
  filePath: string;
  accountId: string;
  categoryId?: string | null;
  mapping: CsvColumnMapping;
  /** JS Date parsing works for ISO/most common formats; for DD/MM/YYYY set this true. */
  dayFirst?: boolean;
}

function parseDate(raw: string, dayFirst: boolean): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Already ISO (YYYY-MM-DD or full timestamp)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

  const parts = trimmed.split(/[\/\-.]/).map((p) => p.trim());
  if (parts.length === 3) {
    let [a, b, c] = parts;
    if (c.length === 2) c = `20${c}`;
    const day = dayFirst ? a : b;
    const month = dayFirst ? b : a;
    const year = c;
    const d = day.padStart(2, "0");
    const m = month.padStart(2, "0");
    if (year.length === 4 && !Number.isNaN(Number(d)) && !Number.isNaN(Number(m))) {
      return `${year}-${m}-${d}`;
    }
  }
  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) return fallback.toISOString().slice(0, 10);
  return null;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.,-]/g, "");
  // Handle "1.234.567,89" (id-ID) vs "1,234,567.89" (en-US) heuristically:
  // if both separators present, assume the last one is the decimal separator.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    // Only comma present: treat as decimal separator if it looks like one (2 digits after)
    const after = cleaned.length - lastComma - 1;
    normalized = after === 2 ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
  }
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}

export function registerImportCsvHandlers() {
  ipcMain.handle("import:chooseFile", async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win ?? undefined!, {
      title: "Pilih file CSV",
      filters: [{ name: "CSV", extensions: ["csv"] }],
      properties: ["openFile"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("import:preview", async (_e, filePath: string) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });
    const headers = parsed.meta.fields ?? [];
    const rows = parsed.data.slice(0, 10);
    return { headers, rows, totalRows: parsed.data.length, errors: parsed.errors.slice(0, 5) };
  });

  ipcMain.handle("import:commit", async (_e, options: CsvImportOptions) => {
    const content = fs.readFileSync(options.filePath, "utf-8");
    const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });
    const db = getDb();
    const account = (await db.select().from(accounts).where(eq(accounts.id, options.accountId)))[0];
    if (!account) throw new Error("Akun tidak ditemukan");

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const rowsToInsert: (typeof transactions.$inferInsert)[] = [];

    for (const [i, row] of parsed.data.entries()) {
      const dateRaw = row[options.mapping.date];
      const amountRaw = row[options.mapping.amount];
      if (!dateRaw || amountRaw === undefined) {
        skipped++;
        continue;
      }
      const date = parseDate(dateRaw, !!options.dayFirst);
      if (!date) {
        skipped++;
        errors.push(`Baris ${i + 2}: tanggal "${dateRaw}" tidak dikenali`);
        continue;
      }
      const rawAmount = parseAmount(amountRaw);
      let type: "income" | "expense" = "expense";
      let amount = Math.abs(rawAmount);

      if (options.mapping.signedAmount) {
        type = rawAmount < 0 ? "expense" : "income";
      } else if (options.mapping.type) {
        const typeRaw = (row[options.mapping.type] ?? "").toLowerCase();
        type = typeRaw.includes("in") || typeRaw.includes("masuk") || typeRaw.includes("credit") ? "income" : "expense";
      }

      rowsToInsert.push({
        id: newId(),
        accountId: options.accountId,
        categoryId: options.categoryId ?? null,
        type,
        transferAccountId: null,
        amount,
        currency: account.currency,
        date,
        note: options.mapping.note ? row[options.mapping.note] ?? "" : "",
        createdAt: nowIso(),
      });
      imported++;
    }

    if (rowsToInsert.length > 0) {
      // Chunk inserts to stay well under SQLite's variable limit.
      const chunkSize = 200;
      for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        await db.insert(transactions).values(rowsToInsert.slice(i, i + chunkSize));
      }
    }

    return { imported, skipped, errors };
  });
}
