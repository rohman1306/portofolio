import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface MarketQuote {
  requestedSymbol: string;
  symbol: string;
  price: number;
  currency: string;
  name: string;
}

type Category = "Saham" | "Crypto" | "ETF" | "Reksadana" | "Lainnya";
type Exchange = "IDX" | "Global" | "auto";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const YAHOO_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
const TV_HOST = "https://scanner.tradingview.com";

const REQUEST_TIMEOUT = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/* ─── Yahoo Finance ────────────────────────────────────────── */

async function fetchYahooRaw(symbol: string): Promise<MarketQuote | null> {
  for (const host of YAHOO_HOSTS) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      if (typeof price !== "number") continue;
      return {
        requestedSymbol: symbol,
        symbol: meta?.symbol ?? symbol,
        price,
        currency: meta?.currency ?? "USD",
        name: meta?.shortName ?? meta?.longName ?? symbol,
      };
    } catch { /* next host */ }
  }
  return null;
}

function toBaseCrypto(ticker: string): string {
  return ticker.replace(/(USDT|USDC|USD)$/i, "");
}

function toYahooCryptoSymbol(ticker: string): string {
  return `${toBaseCrypto(ticker)}-USD`;
}

async function resolveYahoo(symbol: string, exchange: Exchange, category: Category | null): Promise<MarketQuote | null> {
  const hasSuffix = symbol.includes(".");
  if (category === "Crypto") return fetchYahooRaw(toYahooCryptoSymbol(symbol));
  if (exchange === "IDX") {
    if (!hasSuffix) { const r = await fetchYahooRaw(`${symbol}.JK`); if (r) return r; }
    return fetchYahooRaw(symbol);
  }
  if (exchange === "Global") {
    const r = await fetchYahooRaw(symbol);
    if (r) return r;
    if (!hasSuffix) { const r2 = await fetchYahooRaw(`${symbol}.JK`); if (r2) return r2; }
    return null;
  }
  if (!hasSuffix) { const r = await fetchYahooRaw(`${symbol}.JK`); if (r) return r; }
  return fetchYahooRaw(symbol);
}

/* ─── TradingView Scanner ──────────────────────────────────── */

interface TVQuote {
  price: number;
  currency: string;
  name: string;
}

function toTradingViewCryptoTickers(ticker: string): string[] {
  const base = toBaseCrypto(ticker);
  return [`BINANCE:${base}USDT`, `BINANCE:${base}USDC`, `COINBASE:${base}USD`];
}

async function fetchTVMarket(market: string, tickers: string[]): Promise<Map<string, TVQuote>> {
  const out = new Map<string, TVQuote>();
  if (tickers.length === 0) return out;
  try {
    const res = await fetch(`${TV_HOST}/${market}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({
        symbols: { tickers, query: { types: [] } },
        columns: ["close", "name", "currency"],
        range: [0, tickers.length],
      }),
      cache: "no-store",
    });
    if (!res.ok) return out;
    const json = await res.json();
    for (const row of json?.data ?? []) {
      const price = row?.d?.[0];
      if (typeof price !== "number" || Number.isNaN(price)) continue;
      out.set(row.s, {
        price,
        currency: typeof row?.d?.[2] === "string" ? row.d[2] : "USD",
        name: typeof row?.d?.[1] === "string" ? row.d[1] : row.s,
      });
    }
  } catch { /* ignore */ }
  return out;
}

function tradingViewPlan(parsed: { ticker: string; exchange: Exchange; category: Category | null }): { market: string; tickers: string[] } {
  if (parsed.category === "Crypto") return { market: "crypto", tickers: toTradingViewCryptoTickers(parsed.ticker) };
  if (parsed.exchange === "IDX") return { market: "indonesia", tickers: [`IDX:${parsed.ticker}`] };
  return { market: "america", tickers: [`NASDAQ:${parsed.ticker}`, `NYSE:${parsed.ticker}`, `AMEX:${parsed.ticker}`] };
}

/* ─── Investing.com ────────────────────────────────────────── */

const INVESTING_ID_MAP: Record<string, number> = {};

function investingExchangeTag(exchange: Exchange): string {
  return exchange === "IDX" ? "idx" : "us";
}

async function fetchInvestingDotCom(ticker: string, exchange: Exchange, category: Category | null): Promise<MarketQuote | null> {
  if (category === "Crypto") return null;

  try {
    const searchUrl = `https://api.investing.com/api/search/v2/?q=${encodeURIComponent(ticker)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "application/json",
        "domain-id": "www",
      },
      cache: "no-store",
    });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json() as {
      quotes?: Array<{ symbolFull?: string; pairId?: number; name?: string; exchange?: string; pair_type?: string }>;
    };

    const tag = investingExchangeTag(exchange);
    const match = searchData.quotes?.find((q) => {
      const sym = (q.symbolFull ?? "").toUpperCase();
      const ex = (q.exchange ?? "").toLowerCase();
      return sym.includes(ticker.toUpperCase()) && (ex.includes(tag) || tag === "us");
    });

    if (!match?.pairId) return null;

    const priceUrl = `https://api.investing.com/api/financialdata/assets/${match.pairId}`;
    const priceRes = await fetch(priceUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "application/json",
        "domain-id": "www",
      },
      cache: "no-store",
    });
    if (!priceRes.ok) return null;
    const priceData = await priceRes.json() as {
      last?: number;
      changePercent?: number;
      name?: string;
      currency?: string;
    };

    if (typeof priceData.last !== "number") return null;

    return {
      requestedSymbol: ticker,
      symbol: match.symbolFull ?? ticker,
      price: priceData.last,
      currency: priceData.currency ?? (exchange === "IDX" ? "IDR" : "USD"),
      name: priceData.name ?? match.name ?? ticker,
    };
  } catch {
    return null;
  }
}

/* ─── Finviz ───────────────────────────────────────────────── */

function parseFinvizPrice(html: string): { price: number; name: string; currency: string } | null {
  const priceMatch = html.match(/<strong[^>]*class="[^"]*quote-price[_-]price[^"]*"[^>]*>([^<]+)</i)
    ?? html.match(/data-testid="qfs-price"[^>]*>([^<]+)</)
    ?? html.match(/<(?:span|strong)[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)</i)
    ?? html.match(/<td[^>]*class="snapshot-td2-cp"[^>]*>([^<]+)</);
  if (!priceMatch?.[1]) return null;
  const priceStr = priceMatch[1].replace(/,/g, "").trim();
  const price = parseFloat(priceStr);
  if (Number.isNaN(price)) return null;

  const nameMatch = html.match(/<h1[^>]*class="[^"]*quote-header[^"]*"[^>]*>([^<]+)/i);
  const name = nameMatch?.[1]?.trim() ?? "";

  return { price, name, currency: "USD" };
}

async function fetchFinviz(ticker: string): Promise<MarketQuote | null> {
  try {
    const res = await fetch(`https://finviz.com/quote.ashx?t=${encodeURIComponent(ticker)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const parsed = parseFinvizPrice(html);
    if (!parsed) return null;
    return {
      requestedSymbol: ticker,
      symbol: ticker,
      price: parsed.price,
      currency: parsed.currency,
      name: parsed.name || ticker,
    };
  } catch {
    return null;
  }
}

/* ─── Symbol Parsing ───────────────────────────────────────── */

function parseSymbol(raw: string): { ticker: string; exchange: Exchange; category: Category | null } {
  const parts = raw.split(":");
  const ticker = (parts[0] ?? "").trim().toUpperCase();
  const market = (parts[1] ?? "").trim().toUpperCase();
  let exchange: Exchange = "auto";
  if (market === "IDX") exchange = "IDX";
  else if (market === "GLOBAL") exchange = "Global";
  const valid: Category[] = ["Saham", "Crypto", "ETF", "Reksadana", "Lainnya"];
  const normalizedCategory = (parts[2] ?? "").trim().toLowerCase();
  const parsedCategory = valid.find((c) => c.toLowerCase() === normalizedCategory) ?? null;
  return { ticker, exchange, category: parsedCategory };
}

/* ─── Main Handler ─────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbols")?.trim();
  if (!raw) {
    return Response.json({ error: "Missing symbols query parameter" }, { status: 400 });
  }

  const symbols = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30);
  const parsed = symbols.map(parseSymbol);

  const tvByMarket = new Map<string, string[]>();
  const tvPlans = parsed.map((p) => {
    const plan = tradingViewPlan(p);
    for (const ticker of plan.tickers) {
      if (!tvByMarket.has(plan.market)) tvByMarket.set(plan.market, []);
      if (!tvByMarket.get(plan.market)!.includes(ticker)) tvByMarket.get(plan.market)!.push(ticker);
    }
    return plan;
  });

  const [tvMaps, yahooResults] = await Promise.all([
    Promise.all(
      [...tvByMarket.entries()].map(([market, tickers]) => fetchTVMarket(market, tickers))
    ),
    Promise.all(parsed.map((p) => resolveYahoo(p.ticker, p.exchange, p.category))),
  ]);

  const tvResults = new Map<string, TVQuote>();
  for (const map of tvMaps) {
    for (const [ticker, quote] of map) tvResults.set(ticker, quote);
  }

  const quotes: MarketQuote[] = [];
  const errors: string[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    const plan = tvPlans[i];

    let tvQuote: TVQuote | null = null;
    for (const ticker of plan.tickers) {
      if (tvResults.has(ticker)) { tvQuote = tvResults.get(ticker)!; break; }
    }

    if (tvQuote) {
      quotes.push({
        requestedSymbol: p.ticker,
        symbol: plan.tickers.find((t) => tvResults.has(t))!,
        price: tvQuote.price,
        currency: tvQuote.currency,
        name: tvQuote.name,
      });
      continue;
    }

    const yahooQuote = yahooResults[i];
    if (yahooQuote) {
      quotes.push({ ...yahooQuote, requestedSymbol: p.ticker });
      continue;
    }

    if (p.category !== "Crypto") {
      const investingResult = await withTimeout(
        fetchInvestingDotCom(p.ticker, p.exchange, p.category),
        REQUEST_TIMEOUT
      );
      if (investingResult) {
        quotes.push({ ...investingResult, requestedSymbol: p.ticker });
        continue;
      }
    }

    if (p.category !== "Crypto" && p.exchange !== "IDX") {
      const finvizResult = await withTimeout(fetchFinviz(p.ticker), REQUEST_TIMEOUT);
      if (finvizResult) {
        quotes.push({ ...finvizResult, requestedSymbol: p.ticker });
        continue;
      }
    }

    if (p.exchange === "IDX" && p.category !== "Crypto") {
      const altPlan = tradingViewPlan({ ...p, exchange: "Global" });
      const altTv = await fetchTVMarket(altPlan.market, altPlan.tickers);
      let altTvQuote: TVQuote | null = null;
      for (const ticker of altPlan.tickers) {
        if (altTv.has(ticker)) { altTvQuote = altTv.get(ticker)!; break; }
      }
      if (altTvQuote) {
        quotes.push({
          requestedSymbol: p.ticker,
          symbol: altPlan.tickers.find((t) => altTv.has(t))!,
          price: altTvQuote.price,
          currency: altTvQuote.currency,
          name: altTvQuote.name,
        });
        continue;
      }

      const altYahoo = await resolveYahoo(p.ticker, "Global", p.category);
      if (altYahoo) {
        quotes.push({ ...altYahoo, requestedSymbol: p.ticker });
        continue;
      }

      const altFinviz = await withTimeout(fetchFinviz(p.ticker), REQUEST_TIMEOUT);
      if (altFinviz) {
        quotes.push({ ...altFinviz, requestedSymbol: p.ticker });
        continue;
      }
    }

    errors.push(p.ticker);
  }

  return Response.json({ quotes, errors });
}
