export type HoldingCategory = "Saham" | "Crypto" | "ETF" | "Reksadana" | "Lainnya";
export type HoldingExchange = "IDX" | "Global";

export interface Holding {
  id: string;
  ticker: string;
  nama_aset: string;
  kategori: HoldingCategory;
  exchange: HoldingExchange;
  jumlah_unit: number;
  harga_beli_rata2: number;
  tanggal_beli: string;
  nilai_saat_ini: number;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export type HoldingFormData = Omit<Holding, "id" | "created_at" | "updated_at">;

export function getAssetCurrency(exchange?: HoldingExchange): "IDR" | "USD" {
  return exchange === "Global" ? "USD" : "IDR";
}
