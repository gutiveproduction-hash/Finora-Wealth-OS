import type { ExchangeRate } from "@/types";

/** Converts `amount` in `currency` into the base currency using a rates map (currency -> rateToBase). */
export function toBase(amount: number, currency: string, rates: Record<string, number>): number {
  const rate = rates[currency] ?? 1;
  return amount * rate;
}

export function ratesToMap(rates: ExchangeRate[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of rates) map[r.currency] = r.rateToBase;
  return map;
}

export const COMMON_CURRENCIES = ["IDR", "USD", "EUR", "SGD", "JPY", "GBP", "AUD", "MYR"];
