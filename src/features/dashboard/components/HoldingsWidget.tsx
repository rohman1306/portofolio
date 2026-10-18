"use client";

import Link from "next/link";
import { Holding } from "@/features/holdings/types/holding";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/format";

interface HoldingsWidgetProps {
  holdings: Holding[];
}

export default function HoldingsWidget({ holdings }: HoldingsWidgetProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const recent = holdings.slice(0, 5);

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t("dashboard.holdingsCardTitle")}</h3>
        <Link href="/holdings" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          {t("dashboard.viewAll")}
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">{t("dashboard.emptyHoldings")}</p>
      ) : (
        <div className="space-y-3">
          {recent.map((holding) => (
            <div
              key={holding.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {holding.ticker}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{holding.nama_aset}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {holding.jumlah_unit} {t("holdings.unitSuffix")} · {holding.kategori}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground shrink-0 ml-3">
                {formatCurrency(holding.jumlah_unit * holding.nilai_saat_ini, currency, rate)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
