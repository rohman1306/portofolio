"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Holding } from "../types/holding";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface HoldingsListProps {
  holdings: Holding[];
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
  onDca: (holding: Holding) => void;
  onSell: (holding: Holding) => void;
  onSelect?: (id: string | null) => void;
  selectedHoldingId?: string | null;
}

const kategoriColors: Record<string, string> = {
  Saham: "bg-blue-50 text-blue-700 border-blue-200",
  Crypto: "bg-amber-50 text-amber-700 border-amber-200",
  ETF: "bg-violet-50 text-violet-700 border-violet-200",
  Reksadana: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Lainnya: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function HoldingsList({
  holdings,
  onEdit,
  onDelete,
  onDca,
  onSell,
  onSelect,
  selectedHoldingId,
}: HoldingsListProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("common.instrument")}</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("common.category")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("common.quantity")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("common.buyPrice")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("common.currentValue")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("common.pnl")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => {
              const totalBeli = holding.jumlah_unit * holding.harga_beli_rata2;
              const totalKini = holding.jumlah_unit * holding.nilai_saat_ini;
              const pnl = totalKini - totalBeli;
              const pnlPercent = totalBeli > 0 ? (pnl / totalBeli) * 100 : 0;
              const isProfit = pnl >= 0;
              const isSelected = selectedHoldingId === holding.id;

              return (
                <motion.tr
                  key={holding.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  onClick={() => onSelect?.(isSelected ? null : holding.id)}
                  className={`border-b border-slate-100 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#f0f7fa]/70 border-l-2 border-l-[#0074a6]"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-slate-900 font-medium">{holding.ticker}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{holding.nama_aset}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`font-medium ${kategoriColors[holding.kategori] || kategoriColors["Lainnya"]}`}
                    >
                      {holding.kategori}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-medium">
                    {formatNumber(holding.jumlah_unit)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {formatCurrency(holding.harga_beli_rata2, currency, rate)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-medium">
                    {formatCurrency(holding.nilai_saat_ini, currency, rate)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isProfit ? (
                        <TrendingUp size={14} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500" />
                      )}
                      <span className={`font-medium ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                        {isProfit ? "+" : ""}{formatCurrency(pnl, currency, rate)}
                      </span>
                      <span className={`text-xs ${isProfit ? "text-emerald-600/70" : "text-red-600/70"}`}>
                        ({isProfit ? "+" : ""}{pnlPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => onDca(holding)}
                        className="h-8 px-3 text-xs font-semibold bg-[#f0f7fa] border border-[#005274]/20 text-[#005274] hover:bg-[#005274] hover:text-white hover:border-[#005274] transition-all duration-200 flex items-center gap-1.5 rounded-md shadow-sm"
                      >
                        <Plus size={14} />
                        {t("holdings.dcaButton")}
                      </Button>
                      <Button
                        onClick={() => onSell(holding)}
                        className="h-8 px-3 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 flex items-center gap-1.5 rounded-md shadow-sm"
                      >
                        <Minus size={14} />
                        {t("holdings.sellButton")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(holding)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-md"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(holding.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
