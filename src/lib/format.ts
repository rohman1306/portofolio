import { Currency } from "@/contexts/CurrencyContext";

const formatters: Record<Currency, Intl.NumberFormat> = {
  IDR: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }),
};

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatCurrency(valueInIdr: number, currency: Currency = "IDR", rate: number = 15800): string {
  const converted = currency === "USD" ? valueInIdr / rate : valueInIdr;
  return formatters[currency].format(converted);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

const plainFormatters: Record<Currency, Intl.NumberFormat> = {
  IDR: new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
};

/** Compact number WITHOUT currency symbol (e.g. "100.00 Jt", "5.55 K", "555"). */
export function formatCompactNumber(valueInIdr: number, currency: Currency = "IDR", rate: number = 15800): string {
  const value = currency === "USD" ? valueInIdr / rate : valueInIdr;
  if (currency === "USD") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)} K`;
    return plainFormatters.USD.format(value);
  }
  if (valueInIdr >= 1_000_000_000) return `${(valueInIdr / 1_000_000_000).toFixed(2)} M`;
  if (valueInIdr >= 1_000_000) return `${(valueInIdr / 1_000_000).toFixed(2)} Jt`;
  if (valueInIdr >= 1_000) return `${(valueInIdr / 1_000).toFixed(0)} Rb`;
  return plainFormatters.IDR.format(valueInIdr);
}

export function formatCompact(valueInIdr: number, currency: Currency = "IDR", rate: number = 15800): string {
  if (currency === "USD") {
    const v = valueInIdr / rate;
    if (v >= 1_000_000) return `$ ${(v / 1_000_000).toFixed(2)} M`;
    if (v >= 1_000) return `$ ${(v / 1_000).toFixed(2)} K`;
    return formatters.USD.format(v);
  }
  if (valueInIdr >= 1_000_000_000) return `Rp ${(valueInIdr / 1_000_000_000).toFixed(2)} M`;
  if (valueInIdr >= 1_000_000) return `Rp ${(valueInIdr / 1_000_000).toFixed(2)} Jt`;
  if (valueInIdr >= 1_000) return `Rp ${(valueInIdr / 1_000).toFixed(0)} Rb`;
  return formatCurrency(valueInIdr, currency, rate);
}
