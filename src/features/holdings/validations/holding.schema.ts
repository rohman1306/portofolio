import { z } from "zod";

export const holdingFormSchema = z.object({
  ticker: z.string().min(1, "Ticker is required"),
  nama_aset: z.string().min(1, "Asset name is required"),
  kategori: z.enum(["Saham", "Crypto", "ETF", "Reksadana", "Lainnya"]),
  exchange: z.enum(["IDX", "Global"]),
  jumlah_unit: z.number().min(0, "Lots must be positive"),
  harga_beli_rata2: z.number().min(0, "Buy price must be positive"),
  tanggal_beli: z.string().min(1, "Buy date is required"),
  nilai_saat_ini: z.number().min(0, "Current value must be positive"),
  catatan: z.string(),
});

export type HoldingFormValues = z.infer<typeof holdingFormSchema>;

export const transactionSchema = z.object({
  units: z.number().min(0.01, "Lots must be at least 0.01"),
  priceDisplay: z.number().min(0.01, "Price must be positive"),
  date: z.string().min(1, "Transaction date is required"),
});

export type TransactionValues = z.infer<typeof transactionSchema>;
