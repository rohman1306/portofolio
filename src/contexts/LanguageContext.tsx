"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({ locale: "id", setLocale: () => {}, t: (k) => k });

let idMessages: Record<string, string> = {};
let enMessages: Record<string, string> = {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored === "id" || stored === "en") setLocaleState(stored);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (locale === "id") {
      import("@/messages/id.json").then((m) => { idMessages = m.default; });
    } else {
      import("@/messages/en.json").then((m) => { enMessages = m.default; });
    }
  }, [locale, loaded]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  const t = (key: string): string => {
    const messages = locale === "id" ? idMessages : enMessages;
    return messages[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
