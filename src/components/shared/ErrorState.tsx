"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card/70 p-12 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-foreground">{t("common.error")}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        {message || t("common.errorDescription") || "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t("common.retry") || "Retry"}
        </Button>
      )}
    </div>
  );
}
