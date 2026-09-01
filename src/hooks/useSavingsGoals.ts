import { useCallback, useState } from "react";

/** A named savings target with running progress, e.g. "Dana Darurat" or "Liburan ke Jepang".
 * Kept local (not in the SQLite schema) — same rationale as useGoal: a lightweight
 * personal target rather than a bookkeeping record tied to real transactions. */
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

const STORAGE_KEY = "finora-savings-goals-v1";

function loadGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage, fall back to empty
  }
  return [];
}

function persist(goals: SavingsGoal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // localStorage can be unavailable (private browsing, quota) — edits just
    // won't persist across reloads in that case, which is acceptable.
  }
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>(loadGoals);

  const addGoal = useCallback((title: string, targetAmount: number) => {
    setGoals((prev) => {
      const next = [
        ...prev,
        { id: crypto.randomUUID(), title, targetAmount, currentAmount: 0, createdAt: new Date().toISOString() },
      ];
      persist(next);
      return next;
    });
  }, []);

  const contribute = useCallback((id: string, amount: number) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
      persist(next);
      return next;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { goals, addGoal, contribute, deleteGoal };
}
