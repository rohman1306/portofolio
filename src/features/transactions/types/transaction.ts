export type TransactionType = "DCA" | "JUAL";

export interface Transaction {
  id: string;
  user_id: string;
  holding_id: string;
  type: TransactionType;
  tanggal: string;
  jumlah_unit: number;
  harga_per_unit: number;
  harga_per_unit_currency: string;
  total_idr: number;
  total_display: number;
  display_currency: string;
  pnl: number | null;
  pnl_percent: number | null;
  avg_price_before: number | null;
  avg_price_after: number | null;
  avg_price_after_currency: string | null;
  is_withdrawn: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionFormData = Omit<Transaction, "id" | "created_at" | "updated_at">;
