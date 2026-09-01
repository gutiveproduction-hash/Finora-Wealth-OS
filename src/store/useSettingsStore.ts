import { create } from "zustand";
import type { ExchangeRate } from "@/types";
import { ratesToMap } from "@/lib/currency";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  loaded: boolean;
  theme: ThemePreference;
  baseCurrency: string;
  isPrivate: boolean;
  rates: ExchangeRate[];
  ratesMap: Record<string, number>;
  load: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setBaseCurrency: (currency: string) => Promise<void>;
  togglePrivacy: () => Promise<void>;
  refreshRates: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  loaded: false,
  theme: "system",
  baseCurrency: "IDR",
  isPrivate: false,
  rates: [],
  ratesMap: { IDR: 1 },

  load: async () => {
    const [settings, rates] = await Promise.all([window.api.settings.getAll(), window.api.exchangeRates.list()]);
    set({
      loaded: true,
      theme: (settings.theme as ThemePreference) ?? "system",
      baseCurrency: settings.baseCurrency ?? "IDR",
      isPrivate: settings.isPrivate === "true",
      rates,
      ratesMap: ratesToMap(rates),
    });
  },

  setTheme: async (theme) => {
    set({ theme });
    await window.api.settings.set("theme", theme);
  },

  setBaseCurrency: async (currency) => {
    set({ baseCurrency: currency });
    await window.api.settings.set("baseCurrency", currency);
  },

  togglePrivacy: async () => {
    const next = !get().isPrivate;
    set({ isPrivate: next });
    await window.api.settings.set("isPrivate", String(next));
  },

  refreshRates: async () => {
    const rates = await window.api.exchangeRates.list();
    set({ rates, ratesMap: ratesToMap(rates) });
  },
}));

/** Resolves "system" to an actual light/dark value and keeps <html class="dark"> in sync. */
export function applyThemeClass(theme: ThemePreference) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
}
