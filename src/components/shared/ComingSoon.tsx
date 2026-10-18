"use client";

import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ComingSoonProps {
  title?: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card/70 p-12 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold text-foreground">
        {title ?? (t("common.comingSoon") || "Coming Soon")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("common.comingSoonDescription") || "This feature is under development."}
      </p>
    </div>
  );
}
