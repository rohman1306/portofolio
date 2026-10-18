"use client";

import { Goal } from "@/features/goals/types/goal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatNumber } from "@/lib/format";

interface GoalsCardProps {
  goals?: Goal[];
}

export default function GoalsCard({ goals: goalsProp }: GoalsCardProps) {
  const { currency, rate } = useCurrency();
  const conv = (v: number) => currency === "USD" ? Math.round(v / rate) : v;
  const goals = (goalsProp ?? []).slice(0, 3).map((g) => ({
    label: g.nama,
    current: conv(g.progress_saat_ini),
    target: conv(g.target_nilai),
    unit: g.target_nilai > 1000 ? (currency === "IDR" ? "Rp" : "$") : "%",
  }));

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Goals</h3>
      {goals.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Belum ada goals</p>
      ) : (
        <div className="space-y-5 flex-1">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 font-medium">{goal.label}</span>
                  <span className="text-slate-900 font-semibold text-xs">
                    {formatNumber(goal.current)}/{formatNumber(goal.target)} {goal.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#005274] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <button className="mt-6 w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
        Manage Goals
      </button>
    </div>
  );
}
