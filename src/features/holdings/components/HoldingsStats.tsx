"use client";

import { DollarSign, TrendingUp, Wallet, BarChart3, Receipt } from "lucide-react";
import StatsCard from "@/features/dashboard/components/StatsCard";
import { Holding } from "../types/holding";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface HoldingsStatsProps {
  holdings: Holding[];
}

export default function HoldingsStats({ holdings }: HoldingsStatsProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const conv = (v: number) => currency === "USD" ? Math.round(v / rate) : v;
  const totalNilai = holdings.reduce((sum, h) => sum + h.jumlah_unit * h.nilai_saat_ini, 0);
  const totalInvestasi = holdings.reduce((sum, h) => sum + h.jumlah_unit * h.harga_beli_rata2, 0);
  const unrealizedPnl = totalNilai - totalInvestasi;
  const pnlPercent = totalInvestasi > 0 ? (unrealizedPnl / totalInvestasi) * 100 : 0;
  const totalAset = holdings.length;

  const currencyPrefix = currency === "IDR" ? "Rp " : "$ ";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title={t("holdings.totalValue")}
        value=""
        numericValue={conv(totalNilai)}
        valuePrefix={currencyPrefix}
        subtitle={`${totalAset} ${t("holdings.assetCount")}`}
        icon={<Receipt size={20} />}
        iconBg="bg-[#f0f7fa]"
        iconColor="text-[#0074a6]"
        valueColor="text-[#005274]"
      />
      <StatsCard
        title={t("holdings.totalInvestment")}
        value=""
        numericValue={conv(totalInvestasi)}
        valuePrefix={currencyPrefix}
        subtitle={t("holdings.initialCapital")}
        icon={<Wallet size={20} />}
        iconBg="bg-slate-100"
        iconColor="text-slate-500"
        valueColor="text-slate-700"
      />
      <StatsCard
        title={t("holdings.unrealizedPnl")}
        value=""
        numericValue={conv(Math.abs(unrealizedPnl))}
        valuePrefix={unrealizedPnl >= 0 ? currencyPrefix : `-${currencyPrefix}`}
        decimals={unrealizedPnl < 0 && Math.abs(unrealizedPnl) < 1000 ? 0 : 0}
        subtitle={`${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(1)}%`}
        icon={<TrendingUp size={20} />}
        iconBg="bg-green-50"
        iconColor="text-green-600"
        valueColor={unrealizedPnl >= 0 ? "text-green-600" : "text-red-500"}
        subtitleColor={unrealizedPnl >= 0 ? "text-green-600" : "text-red-500"}
      />
      <StatsCard
        title={t("holdings.assetCountLabel")}
        value={String(totalAset)}
        subtitle={t("holdings.totalHoldings")}
        icon={<BarChart3 size={20} />}
        iconBg="bg-slate-100"
        iconColor="text-[#005274]"
        valueColor="text-[#005274]"
      />
    </div>
  );
}
