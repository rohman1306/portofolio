"use client";

import { Fragment, useMemo } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Bitcoin, Coins, DollarSign, MapPin, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { Course } from "../types/learning";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  "Belum Mulai": "bg-slate-100 text-slate-700 border-slate-200",
  "Sedang Berjalan": "bg-amber-50 text-amber-700 border-amber-200",
  "Selesai": "bg-green-50 text-green-700 border-green-200",
};

const kategoriConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }> = {
  Crypto: { icon: Bitcoin, color: "bg-orange-50 text-orange-700 border-orange-200" },
  Saham: { icon: Coins, color: "bg-blue-50 text-blue-700 border-blue-200" },
  Forex: { icon: DollarSign, color: "bg-green-50 text-green-700 border-green-200" },
};

const asalConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }> = {
  Lokal: { icon: MapPin, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  Luar: { icon: Globe, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export default function CourseList({ courses, onEdit, onDelete }: CourseListProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();

  const groupedCourses = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const c of courses) {
      const kategori = c.kategori ?? "Crypto";
      const arr = map.get(kategori) ?? [];
      arr.push(c);
      map.set(kategori, arr);
    }
    return Array.from(map.entries());
  }, [courses]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left py-3 px-4 text-slate-500 font-medium w-14">{t("learning.orderColumn")}</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("learning.courseColumn")}</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("learning.providerColumn")}</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("learning.categoryColumn")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("learning.costColumn")}</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("learning.buyDateColumn")}</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">{t("common.status")}</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {groupedCourses.map(([kategori, items]) => (
              <Fragment key={kategori}>
                <tr className="bg-slate-50/80">
                  <td colSpan={8} className="py-2 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {(() => {
                        const KategoriIcon = kategoriConfig[kategori]?.icon ?? kategoriConfig["Saham"].icon;
                        return <KategoriIcon size={12} />;
                      })()}
                      {kategori}
                      <span className="text-slate-400 font-medium normal-case">· {items.length}</span>
                    </span>
                  </td>
                </tr>
                {items.map((c, index) => {
                  const kategori = c.kategori ?? "Crypto";
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {c.urutan_beli ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#f0f7fa] text-[#0074a6] text-xs font-semibold">
                          {c.urutan_beli}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-slate-900 font-medium">{c.nama}</p>
                        {c.link && (
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0074a6] hover:text-[#005274] hover:underline inline-flex items-center"
                            aria-label={c.nama}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                      {c.catatan_insight && (
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{c.catatan_insight}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.penyedia}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant="outline"
                        className={`font-medium border inline-flex items-center gap-1 ${kategoriConfig[kategori]?.color ?? kategoriConfig["Saham"].color}`}
                      >
                        {(() => {
                          const KategoriIcon = kategoriConfig[kategori]?.icon ?? kategoriConfig["Saham"].icon;
                          return <KategoriIcon size={10} />;
                        })()}
                        {kategori}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`font-medium border inline-flex items-center gap-1 ${asalConfig[c.asal]?.color ?? asalConfig["Lokal"].color}`}
                      >
                        {(() => {
                          const AsalIcon = asalConfig[c.asal]?.icon ?? asalConfig["Lokal"].icon;
                          return <AsalIcon size={10} />;
                        })()}
                        {c.asal === "Lokal" ? t("learning.categoryLocal") : t("learning.categoryInternational")}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-medium">{formatCurrency(c.biaya, currency, rate)}</td>
                  <td className="py-3 px-4 text-slate-600">{new Date(c.tanggal_beli).toLocaleDateString("id-ID")}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`font-medium border ${statusColors[c.status] || statusColors["Belum Mulai"]}`}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(c)}
                        className="h-8 w-8 text-slate-400 hover:text-[#0074a6] hover:bg-[#f0f7fa] transition-colors rounded-md"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(c.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-md"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                  </motion.tr>
                );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
