import { useCallback, useEffect, useState } from "react";
import type { Budget } from "@/types";

export function useBudgets(month: string) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [budgetRows, actualRows] = await Promise.all([
      window.api.budgets.list(month),
      window.api.budgets.actuals(month),
    ]);
    setBudgets(budgetRows);
    const map: Record<string, number> = {};
    for (const row of actualRows) map[row.categoryId] = row.spent;
    setActuals(map);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setBudget = useCallback(
    async (categoryId: string, amount: number, currency = "IDR") => {
      await window.api.budgets.upsert({ categoryId, month, amount, currency });
      await refresh();
    },
    [month, refresh]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      await window.api.budgets.delete(id);
      await refresh();
    },
    [refresh]
  );

  return { budgets, actuals, loading, refresh, setBudget, deleteBudget };
}
