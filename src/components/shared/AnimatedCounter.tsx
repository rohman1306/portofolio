"use client";

import CountUp from "react-countup";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimals?: number;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  separator = ".",
  decimals = 0,
  duration = 2,
}: AnimatedCounterProps) {
  return (
    <CountUp
      end={value}
      duration={duration}
      separator={separator}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      useEasing
    />
  );
}
