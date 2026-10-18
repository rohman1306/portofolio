"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, LineChart as LineChartIcon, ChevronDown } from "lucide-react";
import { Holding } from "@/features/holdings/types/holding";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MARKET_REFRESH_INTERVAL_MS } from "@/features/holdings/hooks/useRealtimePriceSync";
import { cn } from "@/lib/utils";

type RangeKey =
  | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y"
  | "2Y" | "3Y" | "4Y" | "5Y" | "6Y" | "7Y" | "8Y" | "9Y" | "10Y";

interface HistoryPoint {
  date: string;
  value: number;
}

interface HistoryResponse {
  range: RangeKey;
  data: HistoryPoint[];
  startValue: number;
  endValue: number;
  changePct: number;
}

interface RangeSummary {
  startValue: number;
  endValue: number;
  changePct: number;
}

const SHORT_RANGES: { key: RangeKey; labelKey: string }[] = [
  { key: "1D", labelKey: "dashboard.rangeDay" },
  { key: "1W", labelKey: "dashboard.rangeWeek" },
  { key: "1M", labelKey: "dashboard.rangeMonth" },
  { key: "3M", labelKey: "dashboard.range3Months" },
  { key: "6M", labelKey: "dashboard.range6Months" },
  { key: "1Y", labelKey: "dashboard.rangeYear" },
];

const LONG_RANGES: { key: RangeKey; labelKey: string }[] = [
  { key: "2Y", labelKey: "dashboard.range2Years" },
  { key: "3Y", labelKey: "dashboard.range3Years" },
  { key: "4Y", labelKey: "dashboard.range4Years" },
  { key: "5Y", labelKey: "dashboard.range5Years" },
  { key: "6Y", labelKey: "dashboard.range6Years" },
  { key: "7Y", labelKey: "dashboard.range7Years" },
  { key: "8Y", labelKey: "dashboard.range8Years" },
  { key: "9Y", labelKey: "dashboard.range9Years" },
  { key: "10Y", labelKey: "dashboard.range10Years" },
];

const EMPTY_SUMMARY: RangeSummary = { startValue: 0, endValue: 0, changePct: 0 };

export default function PortfolioPerformanceChart({ holdings }: { holdings: Holding[] }) {
  const { t, locale } = useLanguage();
  const { currency, rate } = useCurrency();
  const [range, setRange] = useState<RangeKey>("1M");
  const [series, setSeries] = useState<Partial<Record<RangeKey, HistoryPoint[]>>>({});
  const [summary, setSummary] = useState<Record<RangeKey, RangeSummary>>({} as Record<RangeKey, RangeSummary>);
  const [status, setStatus] = useState<Record<RangeKey, "idle" | "done" | "error">>(
    {} as Record<RangeKey, "idle" | "done" | "error">
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const holdingsKey = useMemo(
    () =>
      holdings
        .map((h) => `${h.id}:${h.jumlah_unit}:${h.tanggal_beli}`)
        .sort()
        .join("|"),
    [holdings]
  );

  const realtimeValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.jumlah_unit * h.nilai_saat_ini, 0);
  }, [holdings]);

  const isEmpty = holdings.length === 0;

  useEffect(() => {
    if (isEmpty) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/portfolio-history?range=${range}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load portfolio history");
        const json = (await res.json()) as HistoryResponse;
        if (cancelled) return;
        setSeries((prev) => ({ ...prev, [range]: json.data }));
        setSummary((prev) => ({
          ...prev,
          [range]: { startValue: json.startValue, endValue: json.endValue, changePct: json.changePct },
        }));
        setStatus((prev) => ({ ...prev, [range]: "done" }));
      } catch {
        if (cancelled) return;
        setStatus((prev) => ({ ...prev, [range]: "error" }));
      }
    };

    load();
    const interval = setInterval(load, MARKET_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [range, isEmpty, holdingsKey]);

  const conv = (v: number) => (currency === "USD" ? v / rate : v);

  const points = useMemo(() => {
    const raw = series[range] ?? [];
    if (raw.length === 0) return [];
    const newPoints = raw.map((p) => ({ date: p.date, value: conv(p.value) }));
    if (newPoints.length > 0) {
      newPoints[newPoints.length - 1].value = conv(realtimeValue);
      if (range === "1D") {
        newPoints[newPoints.length - 1].date = new Date().toISOString();
      }
    }
    return newPoints;
  }, [series, range, conv, realtimeValue]);

  const current = useMemo(() => {
    const raw = summary[range];
    if (!raw) return EMPTY_SUMMARY;
    const startValue = raw.startValue;
    const endValue = realtimeValue;
    const changePct = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;
    return { startValue, endValue, changePct };
  }, [summary, range, realtimeValue]);

  const changePct = current.changePct;
  const isProfit = changePct >= 0;
  const isPending = status[range] !== "done" && status[range] !== "error";
  const showLoading = isPending && points.length === 0;

  const valueFormatter = new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  const compact = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return `${Math.round(v)}`;
  };

  const dayFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
  });
  const monthYearFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
  });
  const yearFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formatAxisDate = (raw: string) => {
    if (range === "1D") return timeFmt.format(new Date(raw));
    if (range === "1W" || range === "1M" || range === "3M" || range === "6M" || range === "1Y") {
      return dayFmt.format(new Date(`${raw}T00:00:00Z`));
    }
    const d = new Date(`${raw}T00:00:00Z`);
    const month = d.getUTCMonth();
    if (month === 0) return yearFmt.format(d);
    return monthYearFmt.format(d);
  };

  const currentRangeLabel = t(LONG_RANGES.find((r) => r.key === range)?.labelKey ?? "dashboard.rangeYear");

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LineChartIcon size={18} className="text-[#0074a6]" />
              <h3 className="text-lg font-bold text-slate-900">{t("dashboard.performanceTitle")}</h3>
            </div>
            <p className="text-slate-500 text-sm mt-1">{t("dashboard.performanceSubtitle")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {SHORT_RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  range === r.key
                    ? "bg-white text-[#005274] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {t(r.labelKey)}
              </button>
            ))}
          </div>

          <div className="relative inline-block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {LONG_RANGES.some((r) => r.key === range)
                ? currentRangeLabel
                : t("dashboard.rangeYear")}
              <ChevronDown size={14} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px] max-h-[280px] overflow-y-auto" style={{ zIndex: 50 }}>
                {LONG_RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => { setRange(r.key); setDropdownOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs font-medium transition-colors",
                      range === r.key
                        ? "bg-[#f0f7fa] text-[#005274]"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {t(r.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LineChartIcon size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">{t("dashboard.performanceEmpty")}</p>
        </div>
      ) : showLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0074a6]" />
          <p className="text-slate-500 text-sm mt-3">{t("common.loadingApp")}</p>
        </div>
      ) : points.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LineChartIcon size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">{t("dashboard.performanceNoData")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4 mb-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t("dashboard.performanceCurrentValue")}</p>
              <p className="text-2xl font-bold text-slate-900">
                {valueFormatter.format(conv(current.endValue))}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold",
                isProfit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              )}
            >
              {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{isProfit ? "+" : ""}{changePct.toFixed(2)}%</span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0074a6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0074a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatAxisDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#eef2f6" }}
                  minTickGap={28}
                />
                <YAxis
                  tickFormatter={compact}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  cursor={{ stroke: "#0074a6", strokeOpacity: 0.3 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const p = payload[0] as { value?: number } | undefined;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
                        <p className="text-xs text-slate-500">{formatAxisDate(String(label))}</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {valueFormatter.format(p?.value ?? 0)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0074a6"
                  strokeWidth={2}
                  fill="url(#performanceFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#0074a6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 mt-3">{t("dashboard.performanceNote")}</p>
        </>
      )}
    </div>
  );
}
