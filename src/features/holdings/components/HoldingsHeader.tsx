"use client";

import { Plus, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface HoldingsHeaderProps {
  onAdd: () => void;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
}

export default function HoldingsHeader({ onAdd, onRefresh, refreshing }: HoldingsHeaderProps) {
  const { t } = useLanguage();
  return (
    <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("holdings.title")}</h1>
        <p className="text-slate-500 mt-1">
          {t("holdings.description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-[#f0f7fa] border border-[#005274]/20 text-[#005274] hover:bg-[#005274] hover:text-white hover:border-[#005274] transition-all duration-200 font-medium shadow-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {t("holdings.refreshPrices")}
          </Button>
        )}
        <Button onClick={onAdd} className="bg-[#005274] hover:bg-[#003d57] text-white font-medium px-5">
          <Plus className="mr-2 h-4 w-4" />
          {t("holdings.addHolding")}
        </Button>
      </div>
    </div>
  );
}
