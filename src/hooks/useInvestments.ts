import { useCallback, useEffect, useState } from "react";
import type { Asset, Holding } from "@/types";

export function useInvestments() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await window.api.assets.list();
    setAssets(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAsset = useCallback(
    async (input: Partial<Asset>) => {
      const asset = await window.api.assets.create(input);
      await refresh();
      return asset;
    },
    [refresh]
  );

  const updateAsset = useCallback(
    async (id: string, patch: Partial<Asset>) => {
      await window.api.assets.update(id, patch);
      await refresh();
    },
    [refresh]
  );

  const updatePrice = useCallback(
    async (id: string, price: number) => {
      await window.api.assets.updatePrice(id, price);
      await refresh();
    },
    [refresh]
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      const result = await window.api.assets.delete(id);
      await refresh();
      return result;
    },
    [refresh]
  );

  const addHolding = useCallback(
    async (
      input: Partial<Holding> & { recordFundingTransaction?: boolean; fundingCategoryId?: string | null; date?: string }
    ) => {
      await window.api.holdings.create(input);
      await refresh();
    },
    [refresh]
  );

  const deleteHolding = useCallback(
    async (id: string) => {
      await window.api.holdings.delete(id);
      await refresh();
    },
    [refresh]
  );

  const totals = assets.reduce(
    (acc, a) => {
      acc.marketValue += a.marketValue;
      acc.cost += a.totalCost;
      acc.gain += a.gain;
      return acc;
    },
    { marketValue: 0, cost: 0, gain: 0 }
  );

  return { assets, loading, refresh, createAsset, updateAsset, updatePrice, deleteAsset, addHolding, deleteHolding, totals };
}
