import { randomUUID } from "node:crypto";

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Today as "YYYY-MM-DD" in the machine's local timezone. `toISOString()` converts to UTC
 * first, which reports the previous day for WIB (UTC+7) users between 00:00 and 07:00. */
export function todayIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
