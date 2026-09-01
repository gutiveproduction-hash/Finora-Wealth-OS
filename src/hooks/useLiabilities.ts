import { useCallback, useEffect, useState } from "react";
import type { Liability } from "@/types";

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await window.api.liabilities.list();
    setLiabilities(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLiability = useCallback(
    async (input: Partial<Liability>) => {
      await window.api.liabilities.create(input);
      await refresh();
    },
    [refresh]
  );

  const updateLiability = useCallback(
    async (id: string, patch: Partial<Liability>) => {
      await window.api.liabilities.update(id, patch);
      await refresh();
    },
    [refresh]
  );

  const deleteLiability = useCallback(
    async (id: string) => {
      await window.api.liabilities.delete(id);
      await refresh();
    },
    [refresh]
  );

  const totalBalance = liabilities.reduce((s, l) => s + l.balance, 0);

  return { liabilities, loading, refresh, createLiability, updateLiability, deleteLiability, totalBalance };
}
