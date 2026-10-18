import { HoldingCategory, HoldingExchange } from "../types/holding";

export interface MarketQuote {
  requestedSymbol: string;
  symbol: string;
  price: number;
  currency: string;
  name: string;
}

export function formatMarketSymbol(ticker: string, exchange: HoldingExchange, category?: HoldingCategory): string {
  const base = `${ticker.trim().toUpperCase()}:${exchange}`;
  return category ? `${base}:${category}` : base;
}

export async function fetchMarketQuotes(symbols: string[]): Promise<MarketQuote[]> {
  if (symbols.length === 0) return [];

  const res = await fetch(`/api/market-price?symbols=${encodeURIComponent(symbols.join(","))}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { quotes?: MarketQuote[] };
  return data.quotes ?? [];
}

export function isPriceSourceCategory(category: HoldingCategory): boolean {
  return ["Saham", "Crypto", "ETF", "Reksadana", "Lainnya"].includes(category);
}

export function convertToIdr(price: number, currency: string, rate: number): number {
  if (currency === "IDR") return price;
  return price * rate;
}
