"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAllTransactionsQuery } from "../hooks/useTransactionQuery";
import { useHoldingsQuery } from "@/features/holdings/hooks/useHoldingQuery";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp, TrendingDown, Wallet, Clock, History, Plus } from "lucide-react";
import AddPastTransactionDialog from "./AddPastTransactionDialog";

const typeConfig = {
  DCA: {
    labelKey: "holdings.dcaButton",
    bgClass: "bg-[#f0f7fa]",
    textClass: "text-[#0074a6]",
    borderClass: "border-[#0074a6]/20",
  },
  JUAL: {
    labelKey: "holdings.sellButton",
    bgClass: "bg-rose-50",
    textClass: "text-rose-600",
    borderClass: "border-rose-200",
  },
};

export default function AllTransactionsHistory() {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const { data: transactions = [], isLoading } = useAllTransactionsQuery();
  const { data: holdings = [] } = useHoldingsQuery();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const holdingMap = new Map(holdings.map((h) => [h.id, h]));

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("holdings.transactionHistory")}</h4>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#0074a6]" />
        </div>
      </div>
    );
  }

  if (transactions.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("holdings.transactionHistory")}</h4>
        </div>
        <button
          onClick={() => setAddDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0f7fa] text-xs font-semibold text-[#005274] hover:bg-[#0074a6] hover:text-white transition-colors"
        >
          <Plus size={14} />
          {t("holdings.addPastTransaction") ?? "Tambah Riwayat"}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-3">{t("holdings.noTransactionsYet") ?? "Belum ada riwayat transaksi"}</p>
      <AddPastTransactionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#0074a6]" />
            <h4 className="text-sm font-semibold text-slate-700">{t("holdings.transactionHistory")}</h4>
            <span className="text-xs text-slate-400 ml-2">{transactions.length} {t("holdings.unitSuffix").toLowerCase()}</span>
          </div>
          <button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0f7fa] text-xs font-semibold text-[#005274] hover:bg-[#0074a6] hover:text-white transition-colors"
          >
            <Plus size={14} />
            {t("holdings.addPastTransaction") ?? "Tambah Riwayat"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium text-xs">{t("common.type")}</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium text-xs">{t("common.instrument")}</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium text-xs">{t("holdings.transactionDate")}</th>
              <th className="text-right py-2.5 px-4 text-slate-500 font-medium text-xs">{t("common.quantity")}</th>
              <th className="text-right py-2.5 px-4 text-slate-500 font-medium text-xs">{t("common.currentValue")}</th>
              <th className="text-right py-2.5 px-4 text-slate-500 font-medium text-xs">{t("common.pnl")}</th>
              <th className="text-center py-2.5 px-4 text-slate-500 font-medium text-xs">{t("holdings.wdStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => {
              const config = typeConfig[tx.type as keyof typeof typeConfig] ?? typeConfig.DCA;
              const isProfit = (tx.pnl ?? 0) >= 0;
              const holding = holdingMap.get(tx.holding_id);
              const holdingTicker = holding?.ticker ?? "—";
              const holdingName = holding?.nama_aset ?? "";

              return (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
                      {tx.type === "DCA" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {t(config.labelKey)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div>
                      <p className="text-slate-900 font-medium text-xs">{holdingTicker}</p>
                      {holdingName && <p className="text-slate-400 text-[10px]">{holdingName}</p>}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-xs">{tx.tanggal}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700 font-medium text-xs">
                    {tx.jumlah_unit}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-semibold text-xs">
                    {formatCurrency(tx.total_idr, currency, rate)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {tx.pnl != null ? (
                      <div className="flex items-center justify-end gap-1">
                        {isProfit ? <TrendingUp size={11} className="text-emerald-500" /> : <TrendingDown size={11} className="text-red-500" />}
                        <span className={`text-xs font-semibold ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                          {isProfit ? "+" : ""}{formatCurrency(tx.pnl, currency, rate)}
                        </span>
                        {tx.pnl_percent != null && (
                          <span className={`text-[10px] ${isProfit ? "text-emerald-600/70" : "text-red-600/70"}`}>
                            ({tx.pnl_percent >= 0 ? "+" : ""}{tx.pnl_percent.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {tx.type === "JUAL" ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        tx.is_withdrawn
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        <Wallet size={10} />
                        {tx.is_withdrawn ? t("holdings.withdrawn") : t("holdings.notWithdrawn")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">-</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <AddPastTransactionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
