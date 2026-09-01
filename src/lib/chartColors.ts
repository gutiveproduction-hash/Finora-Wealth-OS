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
