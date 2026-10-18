"use client";

import { SearchX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NoData() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card/70 p-12 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold text-foreground">{t("common.noData") || "No Data"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("common.noDataDescription") || "No data available to display."}
      </p>
    </div>
  );
}
