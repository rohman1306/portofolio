"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  separator?: string;
}

export default function AnimatedPrice({
  value,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
  separator = ".",
}: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [direction, setDirection] = useState(0);
  const prevValue = useRef(value);
  const startRef = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    setDirection(value > prevValue.current ? 1 : -1);
    prevValue.current = value;

    const start = startRef.current;
    const diff = value - start;
    const duration = 400;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplayValue(current);
      startRef.current = current;
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = displayValue.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).replace(/,/g, separator === "." ? "." : separator);

  return (
    <span className={`relative inline-block overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={displayValue}
          initial={{ y: direction * 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -direction * 20, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="inline-block"
        >
          {prefix}{formatted}{suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
