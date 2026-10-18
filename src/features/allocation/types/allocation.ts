export const ALLOCATION_CATEGORIES = [
  { kategori: "Saham", warna: "#a855f7" },
  { kategori: "Crypto", warna: "#f59e0b" },
  { kategori: "ETF", warna: "#22c55e" },
  { kategori: "Reksadana", warna: "#06b6d4" },
  { kategori: "Lainnya", warna: "#64748b" },
] as const;

export type AllocationCategory = (typeof ALLOCATION_CATEGORIES)[number]["kategori"];

export interface Allocation {
  id: string;
  kategori: AllocationCategory;
  jumlah_dana: number;
  target_persentase: number;
  warna: string;
}
