import { useCallback, useEffect, useState } from "react";
import type { Transaction } from "@/types";

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: "income" | "expense" | "transfer";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await window.api.transactions.list(JSON.parse(filterKey));
    setTransactions(rows);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTransaction = useCallback(
    async (input: Partial<Transaction>) => {
      await window.api.transactions.create(input);
      await refresh();
    },
    [refresh]
  );

  const updateTransaction = useCallback(
    async (id: string, patch: Partial<Transaction>) => {
      await window.api.transactions.update(id, patch);
      await refresh();
    },
    [refresh]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await window.api.transactions.delete(id);
      await refresh();
    },
    [refresh]
  );

  return { transactions, loading, refresh, createTransaction, updateTransaction, deleteTransaction };
}
