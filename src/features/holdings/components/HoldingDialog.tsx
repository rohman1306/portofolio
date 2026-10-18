"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import FormattedNumberInput from "@/components/shared/FormattedNumberInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Holding, HoldingCategory, HoldingExchange, HoldingFormData } from "../types/holding";
import { getHoldingCategories } from "../services/holding.service";
import { fetchMarketQuotes, isPriceSourceCategory, convertToIdr, formatMarketSymbol } from "../services/market.service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { holdingFormSchema, type HoldingFormValues } from "../validations/holding.schema";

interface HoldingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HoldingFormData) => void;
  editingHolding?: Holding | null;
}

export default function HoldingDialog({
  open,
  onOpenChange,
  onSubmit,
  editingHolding,
}: HoldingDialogProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const isUSD = currency === "USD";
  const symbol = isUSD ? "$" : "Rp";
  const decimals = isUSD ? 2 : 0;
  const locale = isUSD ? "en-US" : "id-ID";

  const form = useForm<HoldingFormValues>({
    resolver: zodResolver(holdingFormSchema),
    defaultValues: {
      ticker: "",
      nama_aset: "",
      kategori: "Saham",
      exchange: "IDX",
      jumlah_unit: 0,
      harga_beli_rata2: 0,
      tanggal_beli: "",
      nilai_saat_ini: 0,
      catatan: "",
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = form;
  const categories = getHoldingCategories();

  // Display values in current currency (converted from IDR)
  const hargaDisplay = watch("harga_beli_rata2");
  const nilaiDisplay = watch("nilai_saat_ini");

  const tickerValue = watch("ticker");
  const kategoriValue = watch("kategori");
  const exchangeValue = watch("exchange");
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    if (editingHolding) {
      reset({
        ticker: editingHolding.ticker,
        nama_aset: editingHolding.nama_aset,
        kategori: editingHolding.kategori,
        exchange: editingHolding.exchange ?? "IDX",
        jumlah_unit: editingHolding.jumlah_unit,
        harga_beli_rata2: isUSD ? editingHolding.harga_beli_rata2 / rate : editingHolding.harga_beli_rata2,
        tanggal_beli: editingHolding.tanggal_beli,
        nilai_saat_ini: isUSD ? editingHolding.nilai_saat_ini / rate : editingHolding.nilai_saat_ini,
        catatan: editingHolding.catatan,
      });
    } else {
      reset({
        ticker: "", nama_aset: "", kategori: "Saham", exchange: "IDX",
        jumlah_unit: 0, harga_beli_rata2: 0, tanggal_beli: "",
        nilai_saat_ini: 0, catatan: "",
      });
    }
  }, [editingHolding, open, isUSD, rate, reset]);

  useEffect(() => {
    if (editingHolding) return;
    const ticker = tickerValue?.trim();
    if (!ticker || !isPriceSourceCategory(kategoriValue)) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setPriceLoading(true);
      try {
        const quotes = await fetchMarketQuotes([formatMarketSymbol(ticker, exchangeValue, kategoriValue)]);
        if (cancelled || quotes.length === 0) return;
        const priceInIdr = convertToIdr(quotes[0].price, quotes[0].currency, rate);
        const displayValue = isUSD ? priceInIdr / rate : priceInIdr;
        setValue("nilai_saat_ini", Math.round(displayValue));
      } finally {
        if (!cancelled) setPriceLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tickerValue, kategoriValue, exchangeValue, isUSD, rate, setValue, editingHolding]);

  const onFormSubmit = (values: HoldingFormValues) => {
    const hargaInIdr = isUSD ? Math.round(values.harga_beli_rata2 * rate) : Math.round(values.harga_beli_rata2);
    const nilaiInIdr = isUSD ? Math.round(values.nilai_saat_ini * rate) : Math.round(values.nilai_saat_ini);
    onSubmit({ ...values, harga_beli_rata2: hargaInIdr, nilai_saat_ini: nilaiInIdr });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingHolding ? t("holdings.editHolding") : t("holdings.addHoldingNew")}
          </DialogTitle>
          <DialogDescription>{t("holdings.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("holdings.tickerLabel")}</label>
              <Input
                placeholder={t("holdings.tickerPlaceholder")}
                {...register("ticker")}
                onChange={(e) => setValue("ticker", e.target.value.toUpperCase())}
                className="bg-card border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("common.category")}</label>
              <Select value={watch("kategori")} onValueChange={(v) => setValue("kategori", v as HoldingCategory)}>
                <SelectTrigger className="w-full bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isPriceSourceCategory(kategoriValue) && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("holdings.exchangeLabel")}</label>
              <Select
                value={exchangeValue}
                onValueChange={(v) => setValue("exchange", v as HoldingExchange)}
              >
                <SelectTrigger className="w-full bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDX">IDX (Indonesia)</SelectItem>
                  <SelectItem value="Global">{t("holdings.exchangeGlobal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("holdings.assetNameLabel")}</label>
            <Input placeholder={t("holdings.assetNamePlaceholder")} {...register("nama_aset")} className="bg-card border-border" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("holdings.unitQuantityLabel")}</label>
              <FormattedNumberInput value={watch("jumlah_unit")}
                onChange={(v) => setValue("jumlah_unit", v ?? 0)} placeholder="0" decimals={2} locale="en-US"
                className="bg-card border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("holdings.buyDateLabel")}</label>
              <Input type="date" {...register("tanggal_beli")} className="bg-card border-border" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("holdings.avgBuyPriceLabel")} <span className="text-muted-foreground/60">({currency})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{symbol}</span>
                <FormattedNumberInput value={hargaDisplay}
                  onChange={(v) => setValue("harga_beli_rata2", v ?? 0)} decimals={decimals} locale={locale}
                  placeholder={isUSD ? "0.00" : "0"} className="bg-card border-border pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("common.currentValue")} <span className="text-muted-foreground/60">({currency})</span>
                {priceLoading && <span className="ml-1 text-xs text-cyan-400 animate-pulse">...</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{symbol}</span>
                <FormattedNumberInput value={nilaiDisplay}
                  onChange={(v) => setValue("nilai_saat_ini", v ?? 0)} decimals={decimals} locale={locale}
                  placeholder={isUSD ? "0.00" : "0"} className="bg-card border-border pl-9" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("holdings.notesLabel")}</label>
            <Input placeholder={t("holdings.notesPlaceholder")} {...register("catatan")} className="bg-card border-border" />
          </div>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
          <Button onClick={handleSubmit(onFormSubmit)} className="bg-blue-600 hover:bg-blue-700">
            {editingHolding ? t("common.save") : t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
