import type { Holding } from "@/features/holdings/types/holding";

export type HistoryRange =
  | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y"
  | "2Y" | "3Y" | "4Y" | "5Y" | "6Y" | "7Y" | "8Y" | "9Y" | "10Y";

export interface HistoryPoint {
  date: string;
  value: number;
}

export interface PortfolioHistory {
  range: HistoryRange;
  data: HistoryPoint[];
  startValue: number;
  endValue: number;
  changePct: number;
  currency: "IDR";
}

const YAHOO_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const DEFAULT_RATE = 15800;
const CACHE_TTL_MS = 5 * 60 * 1000;

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

interface RangeConfig {
  range: string;
  interval: string;
  days: number;
}

const RANGE_CONFIG: Record<HistoryRange, RangeConfig> = {
  "1D": { range: "1d", interval: "60m", days: 0 },
  "1W": { range: "1mo", interval: "1d", days: 6 },
  "1M": { range: "1mo", interval: "1d", days: 29 },
  "3M": { range: "3mo", interval: "1d", days: 89 },
  "6M": { range: "6mo", interval: "1d", days: 179 },
  "1Y": { range: "1y", interval: "1d", days: 364 },
  "2Y": { range: "2y", interval: "1wk", days: 730 },
  "3Y": { range: "3y", interval: "1wk", days: 1095 },
  "4Y": { range: "4y", interval: "1wk", days: 1460 },
  "5Y": { range: "5y", interval: "1wk", days: 1825 },
  "6Y": { range: "6y", interval: "1mo", days: 2190 },
  "7Y": { range: "7y", interval: "1mo", days: 2555 },
  "8Y": { range: "8y", interval: "1mo", days: 2920 },
  "9Y": { range: "9y", interval: "1mo", days: 3285 },
  "10Y": { range: "10y", interval: "1mo", days: 3650 },
};

interface YahooBar {
  ts: number;
  close: number;
}

interface YahooResult {
  bars: YahooBar[];
  currency: string | null;
}

const cache = new Map<string, { expiry: number; result: YahooResult }>();

function toYahooSymbol(h: Holding): string {
  if (h.kategori === "Crypto") {
    const base = h.ticker.replace(/(USDT|USDC|USD)$/i, "");
    return `${base}-USD`;
  }
  const ticker = h.ticker.trim().toUpperCase();
  if ((h.exchange ?? "IDX") === "IDX") return `${ticker}.JK`;
  return ticker;
}

async function fetchYahoo(symbol: string, range: string, interval: string): Promise<YahooResult> {
  const key = `${symbol}|${range}|${interval}`;
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.result;

  let result: YahooResult = { bars: [], currency: null };

  for (const host of YAHOO_HOSTS) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) continue;

      const json = (await res.json()) as {
        chart?: {
          result?: {
            timestamp?: number[];
            meta?: { currency?: string };
            indicators?: { quote?: { close?: (number | null)[] }[] };
          }[];
        };
      };
      const r = json?.chart?.result?.[0];
      if (!r) continue;

      const timestamps = r.timestamp ?? [];
      const closes = r.indicators?.quote?.[0]?.close ?? [];
      const bars: YahooBar[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const close = closes[i];
        if (typeof close !== "number" || !Number.isFinite(close)) continue;
        bars.push({ ts: timestamps[i] * 1000, close });
      }
      if (bars.length > 0) {
        result = { bars, currency: r.meta?.currency ?? null };
        break;
      }
    } catch {
      // try next host
    }
  }

  cache.set(key, { expiry: Date.now() + CACHE_TTL_MS, result });
  return result;
}

function lookupAtOrBefore(bars: YahooBar[], target: number): number | null {
  if (bars.length === 0) return null;
  let lo = 0;
  let hi = bars.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (bars[mid].ts <= target) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans >= 0 ? bars[ans].close : null;
}

function utcDayStart(ts: number): number {
  return Math.floor(ts / DAY_MS) * DAY_MS;
}

function hourStartOf(ts: number): number {
  return Math.floor(ts / HOUR_MS) * HOUR_MS;
}

interface HoldingEntry {
  jumlahUnit: number;
  buyMs: number;
  currency: string;
  bars: YahooBar[];
}

function valueAtTarget(entries: HoldingEntry[], rateBars: YahooBar[], target: number): number {
  let total = 0;
  for (const entry of entries) {
    if (Number.isFinite(entry.buyMs) && entry.buyMs > target) continue;
    const close = lookupAtOrBefore(entry.bars, target);
    if (close == null) continue;
    let price = close;
    if (entry.currency !== "IDR") {
      const rate = lookupAtOrBefore(rateBars, target) ?? DEFAULT_RATE;
      price = close * rate;
    }
    total += entry.jumlahUnit * price;
  }
  return total;
}

export async function buildPortfolioHistory(
  holdings: Holding[],
  range: HistoryRange
): Promise<PortfolioHistory> {
  const cfg = RANGE_CONFIG[range];
  const tracked = holdings.filter((h) => h.jumlah_unit > 0);

  if (tracked.length === 0) {
    return { range, data: [], startValue: 0, endValue: 0, changePct: 0, currency: "IDR" };
  }

  const symbols = [...new Set(tracked.map(toYahooSymbol))];
  const fetched = await Promise.all(symbols.map((s) => fetchYahoo(s, cfg.range, cfg.interval)));
  const bySymbol = new Map<string, YahooResult>();
  symbols.forEach((s, i) => bySymbol.set(s, fetched[i]));

  const needsUsd = tracked.some((h) => {
    const cur = bySymbol.get(toYahooSymbol(h))?.currency;
    return cur != null && cur !== "IDR";
  });
  const rateResult = needsUsd
    ? await fetchYahoo("USDIDR=X", cfg.range, cfg.interval)
    : { bars: [], currency: null };

  const currentTotal = tracked.reduce((sum, h) => sum + h.jumlah_unit * h.nilai_saat_ini, 0);

  const entries: HoldingEntry[] = tracked.map((h) => {
    const symbol = toYahooSymbol(h);
    const res = bySymbol.get(symbol);
    const currency =
      res?.currency ?? (h.kategori === "Crypto" || h.exchange === "Global" ? "USD" : "IDR");
    const buyMs = Date.parse(`${h.tanggal_beli.slice(0, 10)}T00:00:00.000Z`);
    return { jumlahUnit: h.jumlah_unit, buyMs, currency, bars: res?.bars ?? [] };
  });

  const data: HistoryPoint[] = [];

  if (range === "1D") {
    const now = Date.now();
    const hourSet = new Set<number>();
    for (const entry of entries) {
      for (const bar of entry.bars) {
        hourSet.add(hourStartOf(bar.ts));
      }
    }
    const hourList = [...hourSet].sort((a, b) => a - b);

    if (hourList.length === 0) {
      data.push({ date: new Date(now - DAY_MS).toISOString(), value: currentTotal });
    }
    for (const hour of hourList) {
      data.push({
        date: new Date(hour).toISOString(),
        value: valueAtTarget(entries, rateResult.bars, hour + HOUR_MS - 1),
      });
    }
    data.push({ date: new Date(now).toISOString(), value: currentTotal });
  } else {
    const todayStart = utcDayStart(Date.now());
    for (let i = cfg.days; i >= 0; i--) {
      const dayStart = todayStart - i * DAY_MS;
      data.push({
        date: new Date(dayStart).toISOString().slice(0, 10),
        value: valueAtTarget(entries, rateResult.bars, dayStart + DAY_MS - 1),
      });
    }
  }

  if (data.length > 0) {
    data[data.length - 1].value = currentTotal;
  }

  const rounded = data.map((p) => ({ date: p.date, value: Math.round(p.value) }));
  const startValue = rounded.length > 0 ? rounded[0].value : 0;
  const endValue = rounded.length > 0 ? rounded[rounded.length - 1].value : 0;
  const changePct = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;

  return { range, data: rounded, startValue, endValue, changePct, currency: "IDR" };
}
