"use client";

import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

const currencies: { value: Currency; label: string }[] = [
  { value: "IDR", label: "IDR" },
  { value: "USD", label: "USD" },
];

export default function CurrencyToggle() {
  const { currency, setCurrency, rate, loading, lastUpdated, refreshRate } = useCurrency();

  const timeAgo = lastUpdated ? getTimeAgo(lastUpdated) : null;

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/50">
        {currencies.map(({ value, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 text-xs px-2.5 h-7 transition-colors",
              currency === value 
                ? "bg-white text-slate-900 shadow-sm hover:bg-white hover:text-slate-900 border border-slate-200" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
            )}
            onClick={() => setCurrency(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>1 USD = {rate.toLocaleString("id-ID")} IDR</span>
        {timeAgo && <span>({timeAgo})</span>}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={refreshRate}
          disabled={loading}
          title="Refresh exchange rate"
        >
          <RefreshCw className={cn("h-2.5 w-2.5", loading && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
