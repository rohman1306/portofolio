"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useHoldingsQuery } from "./useHoldingQuery";
import { useCurrency } from "@/contexts/CurrencyContext";
import * as holdingService from "../services/holding.service";
import {
  fetchMarketQuotes,
  isPriceSourceCategory,
  convertToIdr,
  formatMarketSymbol,
} from "../services/market.service";
import type { Holding } from "../types/holding";

export const MARKET_REFRESH_INTERVAL_MS = 60_000;

export function useRealtimePriceSync() {
  const queryClient = useQueryClient();
  const { rate } = useCurrency();
  const { data: holdings = [] } = useHoldingsQuery();

  const holdingsRef = useRef(holdings);
  useEffect(() => {
    holdingsRef.current = holdings;
  }, [holdings]);

  const [refreshing, setRefreshing] = useState(false);
  const inFlightRef = useRef(false);
  const startedRef = useRef(false);

  const refreshPrices = useCallback(async () => {
    if (inFlightRef.current) return;
    const targets = holdingsRef.current.filter((h) => isPriceSourceCategory(h.kategori));
    if (targets.length === 0) return;

    inFlightRef.current = true;
    setRefreshing(true);
    try {
      const unique = [
        ...new Set(targets.map((h) => formatMarketSymbol(h.ticker, h.exchange ?? "IDX", h.kategori))),
      ];
      if (unique.length === 0) return;

      const quotes = await fetchMarketQuotes(unique);
      const bySymbol = new Map(quotes.map((q) => [q.requestedSymbol, q]));

      const updates: { id: string; nilai_saat_ini: number }[] = [];
      for (const holding of targets) {
        const quote = bySymbol.get(holding.ticker.trim().toUpperCase());
        if (!quote) continue;
        const priceInIdr = convertToIdr(quote.price, quote.currency, rate);
        if (priceInIdr <= 0) continue;
        const rounded = Math.round(priceInIdr);
        if (Math.abs(holding.nilai_saat_ini - rounded) < 1) continue;
        updates.push({ id: holding.id, nilai_saat_ini: rounded });
      }

      if (updates.length === 0) return;

      queryClient.setQueryData<Holding[]>(["holdings"], (prev) =>
        (prev ?? []).map((h) => {
          const u = updates.find((x) => x.id === h.id);
          return u ? { ...h, nilai_saat_ini: u.nilai_saat_ini } : h;
        })
      );

      await Promise.all(
        updates.map((u) => holdingService.updateHolding(u.id, { nilai_saat_ini: u.nilai_saat_ini }))
      );
    } finally {
      setRefreshing(false);
      inFlightRef.current = false;
    }
  }, [queryClient, rate]);

  useEffect(() => {
    if (holdingsRef.current.length === 0 || startedRef.current) return;
    startedRef.current = true;
    refreshPrices();
    const interval = setInterval(refreshPrices, MARKET_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  return { refreshPrices, refreshing };
}
