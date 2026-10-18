"use client";

import { Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HoldingsEmpty() {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-12 text-center">
      <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t("holdings.emptyTitle")}
      </h3>
      <p className="text-muted-foreground text-sm">
        {t("holdings.emptyDescription")}
      </p>
    </div>
  );
}
