"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
}

export default function Loading({ fullScreen = false, text }: LoadingProps) {
  const { t } = useLanguage();
  const displayText = text ?? t("common.loadingApp");

  const spinner = (
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-4 border-border border-t-cyan-500 animate-spin" />
      <div className="absolute inset-1.5 rounded-full border-4 border-transparent border-b-purple-500/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-muted-foreground text-sm font-medium animate-pulse">{displayText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        {spinner}
        <p className="text-muted-foreground text-sm">{displayText}</p>
      </div>
    </div>
  );
}
