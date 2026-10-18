"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useHoldingsQuery } from "@/features/holdings/hooks/useHoldingQuery";
import { useCreateTransactionMutation } from "@/features/transactions/hooks/useTransactionQuery";
import { TransactionFormData } from "@/features/transactions/types/transaction";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

interface AddPastTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPastTransactionDialog({ open, onOpenChange }: AddPastTransactionDialogProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const { data: holdings = [] } = useHoldingsQuery();
  const createTx = useCreateTransactionMutation();

  const [type, setType] = useState<"DCA" | "JUAL">("DCA");
  const [holdingId, setHoldingId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [units, setUnits] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedHolding = holdings.find((h) => h.id === holdingId);
  const priceInIdr = currency === "USD" ? parseFloat(pricePerUnit || "0") * rate : parseFloat(pricePerUnit || "0");
  const numUnits = parseFloat(units || "0");
  const total = type === "DCA" ? numUnits * priceInIdr : numUnits * priceInIdr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!holdingId) {
      toast.error(t("holdings.errorSelectHolding") ?? "Pilih aset terlebih dahulu");
      return;
    }
    if (numUnits <= 0) {
      toast.error(t("holdings.errorUnitsZero"));
      return;
    }
    if (priceInIdr <= 0) {
      toast.error(t("holdings.errorPriceZero"));
      return;
    }

    setSubmitting(true);
    try {
      const txData: TransactionFormData = {
        user_id: "",
        holding_id: holdingId,
        type,
        tanggal: date,
        jumlah_unit: numUnits,
        harga_per_unit: priceInIdr,
        harga_per_unit_currency: "IDR",
        total_idr: total,
        total_display: total,
        display_currency: "IDR",
        pnl: type === "JUAL" ? total - numUnits * (selectedHolding?.harga_beli_rata2 ?? 0) : null,
        pnl_percent: type === "JUAL" && selectedHolding
          ? ((total - numUnits * selectedHolding.harga_beli_rata2) / (numUnits * selectedHolding.harga_beli_rata2)) * 100
          : null,
        avg_price_before: selectedHolding?.harga_beli_rata2 ?? 0,
        avg_price_after: null,
        avg_price_after_currency: null,
        is_withdrawn: type === "JUAL" ? isWithdrawn : false,
      };

      await createTx.mutateAsync(txData);
      toast.success(`${type === "DCA" ? "DCA" : "Jual"} berhasil ditambahkan`);
      onOpenChange(false);
      setHoldingId("");
      setUnits("");
      setPricePerUnit("");
      setIsWithdrawn(false);
    } catch {
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Plus size={18} />
            </div>
            <span>{t("holdings.addPastTransaction") ?? "Tambah Riwayat Transaksi"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("DCA")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold border transition-all ${
                type === "DCA"
                  ? "bg-[#f0f7fa] border-[#0074a6]/30 text-[#005274]"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <TrendingUp size={14} />
              {t("holdings.dcaButton")}
            </button>
            <button
              type="button"
              onClick={() => setType("JUAL")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold border transition-all ${
                type === "JUAL"
                  ? "bg-rose-50 border-rose-300 text-rose-600"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <TrendingDown size={14} />
              {t("holdings.sellButton")}
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">{t("common.instrument")}</Label>
            <select
              value={holdingId}
              onChange={(e) => setHoldingId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0074a6]/30"
            >
              <option value="">{t("holdings.selectHolding") ?? "Pilih aset..."}</option>
              {holdings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.ticker} — {h.nama_aset}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">{t("holdings.transactionDate")}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">{t("common.quantity")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="h-9 text-sm"
                min="0"
                step="any"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                {t("common.buyPrice")} (IDR)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="h-9 text-sm"
                min="0"
                step="any"
              />
            </div>
          </div>

          {type === "JUAL" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isWithdrawn}
                onChange={(e) => setIsWithdrawn(e.target.checked)}
                className="rounded border-slate-300 text-[#0074a6] focus:ring-[#0074a6]/30"
              />
              <span className="text-xs text-slate-600">{t("holdings.withdrawn") ?? "Sudah di-withdraw (WD)"}</span>
            </label>
          )}

          <Button
            type="submit"
            disabled={submitting || !holdingId}
            className="w-full h-9 bg-[#005274] hover:bg-[#0074a6] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {submitting ? t("common.loadingApp") : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
