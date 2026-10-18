"use client";

import { useLanguage, Locale } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const locales: { value: Locale; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/50">
      {locales.map(({ value, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-xs px-2.5 h-7 transition-colors",
            locale === value 
              ? "bg-white text-slate-900 shadow-sm hover:bg-white hover:text-slate-900 border border-slate-200" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          )}
          onClick={() => {
            setLocale(value);
            document.documentElement.lang = value;
          }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
