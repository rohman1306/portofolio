"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";

export type Locale = "id" | "en";

const MESSAGES: Record<Locale, Record<string, string>> = { id: idMessages, en: enMessages };

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({ locale: "id", setLocale: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored === "id" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  const t = useMemo(() => {
    const messages = MESSAGES[locale];
    return (key: string): string => messages[key] ?? key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
