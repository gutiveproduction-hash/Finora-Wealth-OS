import { getRawSqlite } from "../db";

/** Returns a map of currency code -> rateToBase (1 unit currency = rateToBase * base currency). */
export function getRatesMap(): Record<string, number> {
  const rows = getRawSqlite()
    .prepare("SELECT currency, rate_to_base as rateToBase FROM exchange_rates")
    .all() as Array<{ currency: string; rateToBase: number }>;
  const map: Record<string, number> = {};
  for (const r of rows) map[r.currency] = r.rateToBase;
  return map;
}

export function getBaseCurrency(): string {
  const row = getRawSqlite().prepare("SELECT value FROM settings WHERE key = 'baseCurrency'").get() as
    | { value: string }
    | undefined;
  return row?.value ?? "IDR";
}

/** Converts `amount` in `currency` into the app's base currency. Unknown currencies pass through 1:1. */
export function toBase(amount: number, currency: string, rates?: Record<string, number>): number {
  const map = rates ?? getRatesMap();
  const rate = map[currency] ?? 1;
  return amount * rate;
}
