"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
  id,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(LENGTH, " ").slice(0, LENGTH).split("");

  const setDigit = (index: number, char: string) => {
    const next = value.padEnd(LENGTH, "0").slice(0, LENGTH).split("");
    next[index] = char;
    const joined = next.join("").replace(/0+$/, "");
    onChange(joined);
    if (char && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
    if (joined.length === LENGTH) {
      onComplete?.(joined);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    if (!char) {
      const next = value.padEnd(LENGTH, "0").slice(0, LENGTH).split("");
      next[index] = "0";
      onChange(next.join("").replace(/0+$/, ""));
      return;
    }
    setDigit(index, char);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length === LENGTH) onComplete?.(pasted);
    else refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div id={id} className={cn("flex justify-between gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
          className="h-12 w-full min-w-0 rounded-lg border border-input bg-muted/30 text-center font-mono text-lg font-bold text-foreground transition-all duration-200 outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
