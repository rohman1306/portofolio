"use client";


import { useLanguage } from "@/contexts/LanguageContext";

interface I18nTextProps {
  id: string;
  fallback?: string;
  values?: Record<string, string | number>;
}

export default function I18nText({ id, fallback, values }: I18nTextProps) {
  const { t } = useLanguage();
  const text = t(id);

  if (text !== id) {
    return <>{text}</>;
  }

  return <>{fallback ?? id}</>;
}
