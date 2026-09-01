import { useCallback, useState } from "react";

/** A single financial milestone shown on the dashboard hero. Kept local (not in the
 * SQLite schema) since it's a lightweight, single-value UI preference rather than a
 * bookkeeping record. */
export interface FinancialGoal {
  title: string;
  targetAmount: number;
}

const STORAGE_KEY = "finora-net-worth-goal-v1";

const DEFAULT_GOAL: FinancialGoal = {
  title: "Target Kebebasan Finansial",
  targetAmount: 1_000_000_000,
};

function loadGoal(): FinancialGoal {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_GOAL, ...JSON.parse(raw) };
  } catch {
    // ignore corrupt storage, fall back to default
  }
  return DEFAULT_GOAL;
}

export function useGoal() {
  const [goal, setGoalState] = useState<FinancialGoal>(loadGoal);

  const setGoal = useCallback((next: FinancialGoal) => {
    setGoalState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage can be unavailable (private browsing, quota) — the goal just
      // won't persist across reloads in that case, which is acceptable.
    }
  }, []);

  return { goal, setGoal };
}
