"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import FormattedNumberInput from "@/components/shared/FormattedNumberInput";
import { Holding, getAssetCurrency } from "../types/holding";
import { useCreateTransactionMutation } from "@/features/transactions/hooks/useTransactionQuery";
import type { TransactionFormData } from "@/features/transactions/types/transaction";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp, TrendingDown, ShoppingCart, Banknote, ArrowRight, Info, Wallet } from "lucide-react";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: Holding | null;
  mode: "DCA" | "JUAL" | null;
  onSuccess: (updatedHolding: Holding | null) => void | Promise<void>;
  editHolding: (id: string, data: Partial<Holding>) => Promise<Holding | null>;
  removeHolding: (id: string) => Promise<boolean>;
}

export default function TransactionDialog({
  open,
  onOpenChange,
  holding,
  mode,
  onSuccess,
  editHolding,
  removeHolding,
}: TransactionDialogProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const isUSD = currency === "USD";
  const createTx = useCreateTransactionMutation();

  const [units, setUnits] = useState<number>(0);
  const [priceDisplay, setPriceDisplay] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [isWithdrawn, setIsWithdrawn] = useState<boolean>(false);

  useEffect(() => {
    if (open && holding) {
      setUnits(0);
      setIsWithdrawn(false);
      setPriceDisplay(isUSD ? holding.nilai_saat_ini / rate : holding.nilai_saat_ini);
      setDate(new Date().toISOString().split("T")[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, holding, mode]);

  if (!holding || !mode) return null;

  const isDCA = mode === "DCA";
  const isSell = mode === "JUAL";
  const isGlobalAsset = holding.exchange === "Global";

  const priceInIdr = isUSD ? priceDisplay * rate : priceDisplay;
  const currentAvgInIdr = holding.harga_beli_rata2;

  const currentTotalValue = holding.jumlah_unit * holding.nilai_saat_ini;
  const currentTotalCost = holding.jumlah_unit * currentAvgInIdr;
  const currentPnl = currentTotalValue - currentTotalCost;
  const currentPnlPercent = currentTotalCost > 0 ? (currentPnl / currentTotalCost) * 100 : 0;

  const newExpenditure = units * priceInIdr;
  const newTotalUnits = holding.jumlah_unit + units;

  let newAvgPriceIdr = 0;
  if (isDCA && newTotalUnits > 0) {
    newAvgPriceIdr = (currentTotalCost + newExpenditure) / newTotalUnits;
  }

  const sellReceipt = isSell ? units * priceInIdr : 0;
  const sellPnl = isSell ? (priceInIdr - currentAvgInIdr) * units : 0;
  const sellPnlPercent = currentAvgInIdr > 0
    ? ((priceInIdr - currentAvgInIdr) / currentAvgInIdr) * 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (units <= 0) {
      toast.error(t("holdings.errorUnitsZero"));
      return;
    }
    if (priceDisplay <= 0) {
      toast.error(t("holdings.errorPriceZero"));
      return;
    }
    if (!date) {
      toast.error(t("holdings.errorTransactionDate"));
      return;
    }

    if (isSell) {
      if (units > holding.jumlah_unit) {
        toast.error(t("holdings.errorExceedsOwnership"));
        return;
      }

      const totalBeli = units * currentAvgInIdr;
      const totalJual = units * priceInIdr;
      const profitLoss = totalJual - totalBeli;
      const pnlPercentVal = totalBeli > 0 ? (profitLoss / totalBeli) * 100 : 0;

      const txData: TransactionFormData = {
        user_id: "",
        holding_id: holding.id,
        type: "JUAL",
        tanggal: date,
        jumlah_unit: units,
        harga_per_unit: priceInIdr,
        harga_per_unit_currency: "IDR",
        total_idr: totalJual,
        total_display: isGlobalAsset ? units * priceDisplay : totalJual,
        display_currency: isGlobalAsset ? "USD" : "IDR",
        pnl: profitLoss,
        pnl_percent: pnlPercentVal,
        avg_price_before: currentAvgInIdr,
        avg_price_after: null,
        avg_price_after_currency: null,
        is_withdrawn: isWithdrawn,
      };

      if (units === holding.jumlah_unit) {
        txData.avg_price_after = 0;
        await Promise.all([
          removeHolding(holding.id),
          createTx.mutateAsync(txData),
        ]);
        toast.success(
          `${t("holdings.sellAssetButton")} ${holding.ticker}. PnL: ${formatCurrency(profitLoss, currency, rate)}${isWithdrawn ? ` · WD: ${formatCurrency(totalJual, currency, rate)}` : ""}`
        );
        onSuccess(null);
      } else {
        const remainingUnits = holding.jumlah_unit - units;
        const updatedAvgInIdr = remainingUnits > 0
          ? (currentTotalCost - totalBeli) / remainingUnits
          : 0;
        txData.avg_price_after = updatedAvgInIdr;

        const [updated] = await Promise.all([
          editHolding(holding.id, {
            jumlah_unit: remainingUnits,
            harga_beli_rata2: Math.round(updatedAvgInIdr),
          }),
          createTx.mutateAsync(txData),
        ]);
        toast.success(
          `${t("holdings.sellAssetButton")} ${units} ${t("holdings.unitSuffix")} ${holding.ticker}. PnL: ${formatCurrency(profitLoss, currency, rate)}${isWithdrawn ? ` · WD: ${formatCurrency(totalJual, currency, rate)}` : ""}`
        );
        onSuccess(updated);
      }
    } else {
      const txData: TransactionFormData = {
        user_id: "",
        holding_id: holding.id,
        type: "DCA",
        tanggal: date,
        jumlah_unit: units,
        harga_per_unit: priceInIdr,
        harga_per_unit_currency: "IDR",
        total_idr: newExpenditure,
        total_display: isGlobalAsset ? units * priceDisplay : newExpenditure,
        display_currency: isGlobalAsset ? "USD" : "IDR",
        pnl: null,
        pnl_percent: null,
        avg_price_before: currentAvgInIdr,
        avg_price_after: newAvgPriceIdr,
        avg_price_after_currency: null,
        is_withdrawn: false,
      };

      const [updated] = await Promise.all([
        editHolding(holding.id, {
          jumlah_unit: newTotalUnits,
          harga_beli_rata2: Math.round(newAvgPriceIdr),
        }),
        createTx.mutateAsync(txData),
      ]);

      toast.success(
        `${t("holdings.dcaAddButton")} ${holding.ticker}. ${newTotalUnits} ${t("holdings.unitSuffix")}, Avg: ${formatCurrency(
          Math.round(newAvgPriceIdr), currency, rate
        )}`
      );
      onSuccess(updated);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isDCA ? "bg-[#f0f7fa] text-[#0074a6]" : "bg-rose-50 text-rose-600"}`}>
              {isDCA ? <TrendingUp size={18} /> : <Banknote size={18} />}
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">
                {isDCA ? t("holdings.dcaAssetTitle") : t("holdings.sellAssetTitle")}
              </span>
              <span className="text-lg font-bold text-[#0074a6] ml-1">{holding.ticker}</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            {isSell
              ? `${t("holdings.sellDescription")}${holding.nama_aset}.`
              : `${t("holdings.dcaDescription")}${holding.nama_aset} ${t("holdings.dcaDescriptionSuffix")}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("holdings.currentOwnership")}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t("common.quantity")}</p>
                <p className="text-sm font-bold text-slate-900">
                  {holding.jumlah_unit} {t("holdings.unitSuffix")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t("holdings.avgPrefix")}</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(currentAvgInIdr, currency, rate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t("holdings.totalAssetValue")}</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(currentTotalValue, currency, rate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t("common.pnl")}</p>
                <p className={`text-sm font-bold flex items-center gap-1 ${currentPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {currentPnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {currentPnl >= 0 ? "+" : ""}{formatCurrency(currentPnl, currency, rate)}
                  <span className="text-xs font-medium">({currentPnlPercent.toFixed(1)}%)</span>
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                {isSell ? t("holdings.unitsSoldLabel") : t("holdings.unitsBoughtLabel")}
              </Label>
              <FormattedNumberInput
                value={units}
                onChange={(v) => setUnits(v ?? 0)}
                placeholder="0"
                decimals={2}
                locale="en-US"
                className="bg-white border-slate-200 text-slate-900 h-10 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                {isSell ? t("holdings.sellPriceLabel") : t("holdings.buyPriceLabel")}
                {isGlobalAsset && <span className="text-slate-400 font-normal ml-1">(USD)</span>}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none font-medium">
                  {isGlobalAsset ? "$" : "Rp"}
                </span>
                <FormattedNumberInput
                  value={priceDisplay}
                  onChange={(v) => setPriceDisplay(v ?? 0)}
                  decimals={isGlobalAsset ? 2 : 0}
                  locale={isGlobalAsset ? "en-US" : "id-ID"}
                  placeholder={isGlobalAsset ? "0.00" : "0"}
                  className="bg-white border-slate-200 text-slate-900 h-10 pl-8 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
                />
              </div>
              {isGlobalAsset && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ≈ {formatCurrency(priceInIdr, "IDR", rate)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                {t("holdings.transactionDate")}
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 h-10 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
                required
              />
            </div>
          </div>

          {isSell && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <button
                type="button"
                onClick={() => setIsWithdrawn(!isWithdrawn)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                  isWithdrawn ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    isWithdrawn ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-amber-600" />
                <span className="text-sm font-medium text-amber-800">{t("holdings.withdrawFunds")}</span>
              </div>
            </div>
          )}

          {isSell && units > 0 && priceDisplay > 0 && (
            <div className="rounded-xl bg-rose-50/50 p-4 space-y-3 border border-rose-100">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight size={14} className="text-rose-400" />
                <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">{t("holdings.totalReceipt")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("holdings.totalReceipt")}</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(sellReceipt, currency, rate)}</span>
              </div>
              <Separator className="bg-rose-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("holdings.estimatedPnl")}</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${sellPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {sellPnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {sellPnl >= 0 ? "+" : ""}
                  {formatCurrency(sellPnl, currency, rate)}
                  <span className="text-xs font-medium">({sellPnlPercent >= 0 ? "+" : ""}{sellPnlPercent.toFixed(1)}%)</span>
                </span>
              </div>
              {isWithdrawn && (
                <>
                  <Separator className="bg-rose-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 font-medium flex items-center gap-1.5">
                      <Wallet size={13} />
                      {t("holdings.withdrawAmount")}
                    </span>
                    <span className="text-sm font-bold text-amber-700">{formatCurrency(sellReceipt, currency, rate)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {isDCA && units > 0 && priceDisplay > 0 && (
            <div className="rounded-xl bg-[#f0f7fa]/60 p-4 space-y-3 border border-[#0074a6]/10">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight size={14} className="text-[#0074a6]" />
                <span className="text-xs font-semibold text-[#0074a6] uppercase tracking-wider">{t("holdings.newAvgPrice")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("holdings.newExpenditure")}</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(newExpenditure, currency, rate)}</span>
              </div>
              <Separator className="bg-[#0074a6]/10" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("holdings.newAvgPrice")}</span>
                <span className="text-sm font-bold text-[#0074a6]">
                  {formatCurrency(Math.round(newAvgPriceIdr), currency, rate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("common.quantity")}</span>
                <span className="text-sm font-bold text-slate-900">
                  {newTotalUnits.toFixed(2)} {t("holdings.unitSuffix")}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium" />}>
              {t("common.cancel")}
            </DialogClose>
            <Button
              type="submit"
              className={
                isSell
                  ? "bg-rose-600 hover:bg-rose-700 text-white font-medium px-5 shadow-sm"
                  : "bg-[#005274] hover:bg-[#003d57] text-white font-medium px-5 shadow-sm"
              }
            >
              {isSell ? (
                <><Banknote className="mr-1.5 h-4 w-4" />{t("holdings.sellAssetButton")}</>
              ) : (
                <><ShoppingCart className="mr-1.5 h-4 w-4" />{t("holdings.dcaAddButton")}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
