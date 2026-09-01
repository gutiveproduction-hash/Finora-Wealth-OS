import { useCallback, useEffect, useState } from "react";
import type { Account } from "@/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await window.api.accounts.list();
    setAccounts(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAccount = useCallback(
    async (input: Partial<Account>) => {
      await window.api.accounts.create(input);
      await refresh();
    },
    [refresh]
  );

  const updateAccount = useCallback(
    async (id: string, patch: Partial<Account>) => {
      await window.api.accounts.update(id, patch);
      await refresh();
    },
    [refresh]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      const result = await window.api.accounts.delete(id);
      await refresh();
      return result;
    },
    [refresh]
  );

  return { accounts, loading, refresh, createAccount, updateAccount, deleteAccount };
}
