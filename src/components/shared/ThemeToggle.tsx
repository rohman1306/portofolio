"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const themes = [
    { value: "light" as const, icon: Sun, label: t("theme.light") },
    { value: "dark" as const, icon: Moon, label: t("theme.dark") },
    { value: "system" as const, icon: Monitor, label: t("theme.system") },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? "default" : "ghost"}
          size="sm"
          className={cn("gap-1.5", theme === value && "shadow-sm")}
          onClick={() => setTheme(value)}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
