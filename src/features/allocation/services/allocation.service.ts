import { getHoldings } from "@/features/holdings/services/holding.service";
import { Holding } from "@/features/holdings/types/holding";
import { ALLOCATION_CATEGORIES, Allocation, AllocationCategory } from "../types/allocation";

const CATEGORY_MAP: Record<string, AllocationCategory> = {
  Saham: "Saham",
  Crypto: "Crypto",
  ETF: "ETF",
  Reksadana: "Reksadana",
  Lainnya: "Lainnya",
};

export function buildAllocationsFromHoldings(holdings: Holding[]): Allocation[] {
  const grouped: Record<string, number> = {};

  for (const h of holdings) {
    const cat = CATEGORY_MAP[h.kategori] || "Lainnya";
    grouped[cat] = (grouped[cat] || 0) + h.jumlah_unit * h.nilai_saat_ini;
  }

  const total = Object.values(grouped).reduce((s, v) => s + v, 0);

  return ALLOCATION_CATEGORIES.map(({ kategori, warna }) => {
    const jumlah_dana = grouped[kategori] || 0;
    return {
      id: kategori.toLowerCase(),
      kategori: kategori as AllocationCategory,
      jumlah_dana,
      target_persentase: total > 0 ? Math.round((jumlah_dana / total) * 100) : 0,
      warna,
    };
  });
}

export async function getAllocations(): Promise<Allocation[]> {
  return buildAllocationsFromHoldings(await getHoldings());
}

export async function getTotalDana(): Promise<number> {
  const holdings = await getHoldings();
  return holdings.reduce(
    (sum, h) => sum + h.jumlah_unit * h.nilai_saat_ini,
    0
  );
}
