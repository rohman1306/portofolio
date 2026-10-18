"use client";

import { useMemo } from "react";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import AllocationPieChart from "@/features/allocation/components/AllocationPieChart";
import AllocationTable from "@/features/allocation/components/AllocationTable";
import { buildAllocationsFromHoldings } from "@/features/allocation/services/allocation.service";
import { useHoldingsQuery } from "@/features/holdings/hooks/useHoldingQuery";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import Loading from "@/components/shared/Loading";

export default function AllocationPage() {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const isUSD = currency === "USD";
  const { data: holdings = [], isLoading } = useHoldingsQuery();

  const allocations = useMemo(() => buildAllocationsFromHoldings(holdings), [holdings]);
  const totalDana = useMemo(
    () => holdings.reduce((sum, h) => sum + h.jumlah_unit * h.nilai_saat_ini, 0),
    [holdings]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("allocation.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("allocation.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationPieChart allocations={allocations} />
        <div className="rounded-xl border border-border/80 bg-card/70 p-6 flex flex-col justify-center">
          <p className="text-muted-foreground text-sm">{t("allocation.totalPortfolio")}</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            <AnimatedCounter
              value={isUSD ? totalDana / rate : totalDana}
              prefix={isUSD ? "$ " : "Rp "}
              separator={isUSD ? "," : "."}
              decimals={isUSD ? 2 : 0}
            />
          </p>
          <div className="mt-4 space-y-2">
            {allocations
              .filter((a) => a.jumlah_dana > 0)
              .map((a) => {
                const pct = totalDana > 0 ? (a.jumlah_dana / totalDana) * 100 : 0;
                return (
                  <div key={a.id}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{a.kategori}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: a.warna }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <AllocationTable allocations={allocations} totalDana={totalDana} />
    </div>
  );
}
