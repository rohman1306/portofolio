"use client";

import { Card } from "@/components/ui/card";
import AnimatedCounter from "@/components/shared/AnimatedCounter";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
  subtitleColor?: string;
  numericValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  decimals?: number;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-500",
  valueColor = "text-[#005274]",
  subtitleColor = "text-slate-600",
  numericValue,
  valuePrefix,
  valueSuffix,
  decimals,
}: StatsCardProps) {
  return (
    <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-start justify-between">
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
            {icon}
          </div>
        </div>
        
        <div>
          <h2 className={`text-3xl font-bold tracking-tight ${valueColor}`}>
            {numericValue !== undefined ? (
              <AnimatedCounter
                value={numericValue}
                prefix={valuePrefix ?? ""}
                suffix={valueSuffix ?? ""}
                decimals={decimals ?? 0}
              />
            ) : (
              value
            )}
          </h2>
          <p className={`text-sm font-medium mt-1 ${subtitleColor}`}>{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}
