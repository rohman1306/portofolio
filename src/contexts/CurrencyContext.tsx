"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Currency = "IDR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number;
  loading: boolean;
  lastUpdated: string | null;
  refreshRate: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "IDR",
  setCurrency: () => {},
  rate: 15800,
  loading: true,
  lastUpdated: null,
  refreshRate: async () => {},
});

const DEFAULT_RATE = 15800;
const RATE_CACHE_KEY = "exchange_rate";
const RATE_TIME_KEY = "exchange_rate_time";
const RATE_UPDATED_KEY = "exchange_rate_updated_at";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const API_SOURCES = [
  "https://open.er-api.com/v6/latest/USD",
  "https://api.exchangerate-api.com/v4/latest/USD",
];

async function fetchRate(): Promise<{ rate: number; updatedAt: string } | null> {
  for (const url of API_SOURCES) {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const rate = Number(data?.rates?.IDR);
      if (Number.isFinite(rate) && rate > 0) {
        const now = new Date().toISOString();
        localStorage.setItem(RATE_CACHE_KEY, String(rate));
        localStorage.setItem(RATE_TIME_KEY, String(Date.now()));
        localStorage.setItem(RATE_UPDATED_KEY, now);
        return { rate, updatedAt: now };
      }
    } catch {
      // try next source
    }
  }
  return null;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("IDR");
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const applyRate = useCallback((r: number, updatedAt: string | null) => {
    setRate(r);
    if (updatedAt) setLastUpdated(updatedAt);
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("currency") as Currency | null;
    if (stored === "IDR" || stored === "USD") setCurrencyState(stored);

    const cached = localStorage.getItem(RATE_CACHE_KEY);
    const cachedTime = localStorage.getItem(RATE_TIME_KEY);
    const cachedUpdated = localStorage.getItem(RATE_UPDATED_KEY);

    if (cached) {
      applyRate(Number(cached), cachedUpdated);
    }

    const lastTime = cachedTime ? Number(cachedTime) : 0;
    if (!cached || Date.now() - lastTime > REFRESH_INTERVAL) {
      fetchRate().then((r) => {
        if (r) applyRate(r.rate, r.updatedAt);
        else setLoading(false); // keep cached/default rate, don't overwrite
      });
    }

    const interval = setInterval(() => {
      fetchRate().then((r) => {
        if (r) applyRate(r.rate, r.updatedAt);
      });
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [applyRate]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  }, []);

  const refreshRate = useCallback(async () => {
    setLoading(true);
    const r = await fetchRate();
    if (r) applyRate(r.rate, r.updatedAt);
    else setLoading(false);
  }, [applyRate]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, loading, lastUpdated, refreshRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
