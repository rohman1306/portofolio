"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";

interface FormattedNumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  decimals?: number;
  allowNull?: boolean;
  className?: string;
  /** Locale for formatting: "id-ID" (IDR, dots=thousand, comma=decimal) or "en-US" (USD, comma=thousand, dot=decimal) */
  locale?: string;
}

function formatDisplay(value: number | null, decimals: number, locale: string): string {
  if (value === null) return "";
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function parseValue(text: string, decimals: number, locale: string): number | null {
  let cleaned: string;
  if (locale === "en-US") {
    // en-US: comma = thousand sep, dot = decimal
    cleaned = text.replace(/,/g, "");
  } else {
    // id-ID: dot = thousand sep, comma = decimal
    cleaned = text.replace(/\./g, "").replace(/,/g, ".");
  }
  const num = Number(cleaned);
  if (isNaN(num)) return null;
  if (decimals === 0) return Math.round(num);
  return Number(num.toFixed(decimals));
}

export default function FormattedNumberInput({
  value,
  onChange,
  placeholder = "0",
  decimals = 0,
  allowNull = false,
  className,
  locale = "id-ID",
}: FormattedNumberInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const displayValue = focused
    ? draft
    : formatDisplay(value, decimals, locale);

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDraft(value !== null ? String(value) : "");
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseValue(draft, decimals, locale);
    if (parsed !== null) {
      onChange(parsed);
    } else if (allowNull) {
      onChange(null);
    } else {
      onChange(0);
    }
  }, [draft, decimals, allowNull, onChange, locale]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (/^[0-9.,]*$/.test(raw)) {
        setDraft(raw);
      }
    },
    []
  );

  return (
    <Input
      ref={ref}
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
