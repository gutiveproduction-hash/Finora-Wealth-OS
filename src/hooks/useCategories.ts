import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await window.api.categories.list();
    setCategories(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCategory = useCallback(
    async (input: Partial<Category>) => {
      await window.api.categories.create(input);
      await refresh();
    },
    [refresh]
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<Category>) => {
      await window.api.categories.update(id, patch);
      await refresh();
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const result = await window.api.categories.delete(id);
      await refresh();
      return result;
    },
    [refresh]
  );

  return { categories, loading, refresh, createCategory, updateCategory, deleteCategory };
}
