"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCompact } from "@/lib/format";
import { Allocation } from "../types/allocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AllocationPieChartProps {
  allocations: Allocation[];
}

export default function AllocationPieChart({ allocations }: AllocationPieChartProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const data = allocations.map((a) => ({
    name: a.kategori,
    value: a.jumlah_dana,
    color: a.warna,
  }));

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{t("allocation.title")}</h3>
      <div className="flex items-center gap-8">
        <div className="h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatCompact(item.value, currency, rate)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
