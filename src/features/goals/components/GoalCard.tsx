"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";
import { Pencil, Trash2, Target, Briefcase, PieChart, BookOpen, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { formatCompactNumber } from "@/lib/format";
import { formatDate } from "@/utils/date";
import { Goal } from "../types/goal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const categoryStyles: Record<string, { icon: any, color: string, bg: string, gradient: string }> = {
  Profit: { icon: Target, color: "text-amber-500", bg: "bg-amber-50", gradient: "from-amber-400 to-amber-600" },
  Portofolio: { icon: Briefcase, color: "text-violet-500", bg: "bg-violet-50", gradient: "from-violet-400 to-violet-600" },
  Alokasi: { icon: PieChart, color: "text-cyan-500", bg: "bg-cyan-50", gradient: "from-cyan-400 to-cyan-600" },
  Pembelajaran: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50", gradient: "from-blue-400 to-blue-600" },
  Dream: { icon: Sparkles, color: "text-pink-500", bg: "bg-pink-50", gradient: "from-pink-400 to-pink-600" },
};

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const { t, locale } = useLanguage();
  const { currency, rate } = useCurrency();
  const conv = (v: number) => currency === "USD" ? Math.round(v / rate) : v;
  const progress = Math.min((goal.progress_saat_ini / goal.target_nilai) * 100, 100);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b"],
    });
  }, []);

  const statusLabels: Record<string, { label: string; className: string }> = {
    on_track: { label: t("goals.statusOnTrack"), className: "bg-emerald-50/80 text-emerald-600 border-emerald-200/60" },
    tertinggal: { label: t("goals.statusBehind"), className: "bg-rose-50/80 text-rose-600 border-rose-200/60" },
    tercapai: { label: t("goals.statusAchieved") + " 🎉", className: "bg-blue-50/80 text-blue-600 border-blue-200/60" },
  };

  const st = statusLabels[goal.status];
  const style = categoryStyles[goal.kategori] || categoryStyles.Dream;
  const Icon = style.icon;

  return (
    <div className="group relative rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-400 overflow-hidden p-5 flex flex-col h-full">
      {/* Decorative background glow on hover */}
      <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[50px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none ${style.bg.replace('50', '200')}`} />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-2.5 rounded-xl ${style.bg} border border-slate-100/50 shadow-sm`}>
            <Icon size={18} className={style.color} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-[15px] leading-tight mb-1.5 line-clamp-2">{goal.nama}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">{goal.kategori}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 rounded-md font-semibold tracking-wide ${st.className}`}>
                {st.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(goal)} className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg">
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(goal.id)} className="h-7 w-7 text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      <div className="mt-auto space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t("common.currentValue")}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-slate-500">{currency === "IDR" ? "Rp" : "$"}</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                <AnimatedCounter value={conv(goal.progress_saat_ini)} separator="." />
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t("goals.targetLabel")}</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-xs font-medium text-slate-400">{currency === "IDR" ? "Rp" : "$"}</span>
              <span className="text-sm font-bold text-slate-600">
                {formatCompactNumber(goal.target_nilai, currency, rate)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <TrendingUp size={14} className={style.color} />
              <AnimatedCounter value={progress} suffix="%" decimals={1} />
            </span>
            {goal.deadline && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar size={13} />
                {formatDate(goal.deadline, "dd MMM yyyy", locale)}
              </span>
            )}
          </div>
          <div className="h-2.5 bg-slate-100/80 rounded-full overflow-hidden shadow-inner border border-slate-200/50 relative">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                goal.status === "tercapai" ? "from-blue-400 to-blue-600" : goal.status === "tertinggal" ? "from-rose-400 to-rose-600" : style.gradient
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
              onAnimationEnd={() => {
                if (goal.status === "tercapai") fireConfetti();
              }}
            >
              {/* Shimmer effect inside progress bar */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
