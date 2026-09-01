import { useCallback, useState } from "react";

/** Config for the dashboard's rule-based "AI Insight" card. There's no external AI
 * call involved — this just tunes the thresholds of the local heuristics (savings
 * rate, top expense category, goal focus) that generate the insight text. */
export interface AiInsightSettings {
  enabled: boolean;
  /** Savings-rate percentage above which the insight is framed as "on track". */
  healthySavingsRate: number;
  showTopExpenseInsight: boolean;
  showGoalFocusInsight: boolean;
}

const STORAGE_KEY = "finora-ai-insight-settings-v1";

const DEFAULTS: AiInsightSettings = {
  enabled: true,
  healthySavingsRate: 20,
  showTopExpenseInsight: true,
  showGoalFocusInsight: true,
};

function loadSettings(): AiInsightSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // ignore corrupt storage, fall back to defaults
  }
  return DEFAULTS;
}

export function useAiInsightSettings() {
  const [settings, setSettingsState] = useState<AiInsightSettings>(loadSettings);

  const setSettings = useCallback((next: AiInsightSettings) => {
    setSettingsState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage can be unavailable (private browsing, quota) — settings just
      // won't persist across reloads in that case, which is acceptable.
    }
  }, []);

  return { settings, setSettings };
}
