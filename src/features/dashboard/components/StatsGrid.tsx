"use client";

import { TrendingUp, BarChart3, Receipt } from "lucide-react";
import StatsCard from "./StatsCard";
import { Holding } from "@/features/holdings/types/holding";
import { useCurrency } from "@/contexts/CurrencyContext";

interface StatsGridProps {
  holdings: Holding[];
}

export default function StatsGrid({ holdings }: StatsGridProps) {
  const { currency, rate } = useCurrency();
  const currencyPrefix = currency === "IDR" ? "Rp " : "$ ";

  const conv = (v: number) => (currency === "USD" ? Math.round(v / rate) : v);

  const totalNilai = holdings.reduce((sum, h) => sum + h.jumlah_unit * h.nilai_saat_ini, 0);
  const totalInvestasi = holdings.reduce((sum, h) => sum + h.jumlah_unit * h.harga_beli_rata2, 0);
  const unrealizedPnl = totalNilai - totalInvestasi;
  const pnlPercent = totalInvestasi > 0 ? (unrealizedPnl / totalInvestasi) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Total Portofolio"
        value=""
        numericValue={conv(totalNilai)}
        valuePrefix={currencyPrefix}
        subtitle={`${holdings.length} Aset`}
        icon={<Receipt size={20} />}
        iconBg="bg-[#f0f7fa]"
        iconColor="text-[#0074a6]"
        valueColor="text-[#005274]"
      />
      <StatsCard
        title="Unrealized P&L"
        value=""
        numericValue={conv(Math.abs(unrealizedPnl))}
        valuePrefix={unrealizedPnl >= 0 ? currencyPrefix : `-${currencyPrefix}`}
        subtitle={`${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(1)}%`}
        icon={<TrendingUp size={20} />}
        iconBg="bg-green-50"
        iconColor="text-green-600"
        valueColor={unrealizedPnl >= 0 ? "text-green-600" : "text-red-500"}
        subtitleColor={unrealizedPnl >= 0 ? "text-green-600" : "text-red-500"}
      />
      <StatsCard
        title="Total Holdings"
        value={String(holdings.length)}
        subtitle="Total Nilai"
        icon={<BarChart3 size={20} />}
        iconBg="bg-slate-100"
        iconColor="text-[#005274]"
        valueColor="text-[#005274]"
      />
    </div>
  );
}
