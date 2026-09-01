import { useCallback, useEffect, useState } from "react";
import type { NetWorthSnapshot, NetWorthSummary } from "@/types";

export function useNetWorth() {
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [s, snaps] = await Promise.all([window.api.networth.summary(), window.api.networth.snapshots()]);
    setSummary(s);
    setSnapshots(snaps);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordSnapshot = useCallback(async () => {
    await window.api.networth.recordSnapshot();
    await refresh();
  }, [refresh]);

  return { summary, snapshots, loading, refresh, recordSnapshot };
}
