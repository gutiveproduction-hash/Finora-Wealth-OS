// A small, distinct categorical palette reused across all charts so colors stay
// consistent app-wide (e.g. the same asset type is always the same color).
export const CHART_PALETTE = [
  "#22a76d", // brand green
  "#3b82f6", // blue
  "#f97316", // orange
  "#8b5cf6", // violet
  "#eab308", // yellow
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#dc2626", // red
  "#64748b", // slate
];

export function colorForIndex(i: number): string {
  return CHART_PALETTE[i % CHART_PALETTE.length];
}

export const ASSET_TYPE_LABELS: Record<string, string> = {
  stock: "Saham",
  mutual_fund: "Reksadana",
  crypto: "Kripto",
  bond: "Obligasi",
  property: "Properti",
  other: "Lainnya",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Tunai",
  investment: "Investasi",
  other: "Lainnya",
};

export const LIABILITY_TYPE_LABELS: Record<string, string> = {
  loan: "Pinjaman",
  credit_card: "Kartu Kredit",
  mortgage: "KPR",
  other: "Lainnya",
};

/** Semantic color per allocation bucket (asset types + the synthetic "cash" bucket), so the
 * same class of holding always renders with the same color across the allocation breakdown. */
export const ALLOCATION_BUCKET_META: Record<string, { label: string; color: string; bgLight: string; bgDark: string }> = {
  cash: { label: "Kas & Tabungan", color: "#0D9488", bgLight: "#CCFBF1", bgDark: "rgba(13, 148, 136, 0.15)" },
  stock: { label: "Saham", color: "#2563EB", bgLight: "#DBEAFE", bgDark: "rgba(37, 99, 235, 0.15)" },
  mutual_fund: { label: "Reksadana", color: "#7C3AED", bgLight: "#EDE9FE", bgDark: "rgba(124, 58, 237, 0.15)" },
  crypto: { label: "Kripto", color: "#D97706", bgLight: "#FEF3C7", bgDark: "rgba(217, 119, 6, 0.15)" },
  bond: { label: "Obligasi", color: "#CA8A04", bgLight: "#FEF08A", bgDark: "rgba(202, 138, 4, 0.15)" },
  property: { label: "Properti", color: "#059669", bgLight: "#D1FAE5", bgDark: "rgba(5, 150, 105, 0.15)" },
  other: { label: "Lainnya", color: "#4B5563", bgLight: "#F3F4F6", bgDark: "rgba(75, 85, 99, 0.15)" },
};
