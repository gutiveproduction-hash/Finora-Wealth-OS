import { useCallback, useState } from "react";

export type BillCategory = "rutin" | "kartu_kredit";

/** A recurring bill/subscription reminder, e.g. "Listrik & Air" or "Netflix". Kept local
 * (not in the SQLite schema) — same rationale as useGoal: a lightweight reminder rather
 * than a bookkeeping record tied to real transactions. */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  recurring: boolean;
  createdAt: string;
}

const STORAGE_KEY = "finora-bills-v1";

function loadBills(): Bill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage, fall back to empty
  }
  return [];
}

function persist(bills: Bill[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch {
    // localStorage can be unavailable (private browsing, quota) — edits just
    // won't persist across reloads in that case, which is acceptable.
  }
}

function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(loadBills);

  const addBill = useCallback((input: Omit<Bill, "id" | "createdAt">) => {
    setBills((prev) => {
      const next = [...prev, { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
      persist(next);
      return next;
    });
  }, []);

  /** Marks a bill paid — recurring bills roll forward a month, one-off bills are removed. */
  const markPaid = useCallback((id: string) => {
    setBills((prev) => {
      const next = prev
        .map((b) => (b.id === id ? (b.recurring ? { ...b, dueDate: addMonths(b.dueDate, 1) } : null) : b))
        .filter((b): b is Bill => b !== null);
      persist(next);
      return next;
    });
  }, []);

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => {
      const next = prev.filter((b) => b.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { bills, addBill, markPaid, deleteBill };
}
