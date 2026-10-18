"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Allocation } from "@/features/allocation/types/allocation";

interface AllocationChartProps {
  allocations?: Allocation[];
}

const COLORS = ["#22c55e", "#a855f7", "#06b6d4", "#f59e0b", "#ef4444", "#ec4899"];

export default function AllocationChart({ allocations }: AllocationChartProps) {
  const data = (allocations ?? []).map((a) => ({ name: a.kategori, value: a.target_persentase, color: a.warna }));
  const colors = data.map((d) => d.color);

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Alokasi</h3>
      {data.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Belum ada alokasi</p>
      ) : (
        <div className="flex items-center gap-8">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={colors[i] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-1">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors[i] || COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
