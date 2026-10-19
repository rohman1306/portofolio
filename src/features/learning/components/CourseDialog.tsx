"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import FormattedNumberInput from "@/components/shared/FormattedNumberInput";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Course, CourseFormData, LearningCategory, LearningOrigin, LearningStatus } from "../types/learning";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { courseFormSchema, type CourseFormValues } from "../validations/learning.schema";
import { BookOpen } from "lucide-react";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CourseFormData) => void;
  editingCourse?: Course | null;
}

export default function CourseDialog({ open, onOpenChange, onSubmit, editingCourse }: CourseDialogProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const isUSD = currency === "USD";

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      nama: "", penyedia: "", biaya: 0, tanggal_beli: "",
      status: "Belum Mulai", kategori: "Crypto", asal: "Lokal", catatan_insight: "", link: "", rating: null,
      urutan_beli: null,
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = form;
  const biayaDisplay = watch("biaya");

  useEffect(() => {
    if (editingCourse) {
      reset({
        nama: editingCourse.nama, penyedia: editingCourse.penyedia,
        biaya: isUSD ? editingCourse.biaya / rate : editingCourse.biaya,
        tanggal_beli: editingCourse.tanggal_beli,
        status: editingCourse.status,
        kategori: editingCourse.kategori ?? "Crypto",
        asal: editingCourse.asal ?? "Lokal",
        catatan_insight: editingCourse.catatan_insight,
        link: editingCourse.link ?? "",
        rating: editingCourse.rating,
        urutan_beli: editingCourse.urutan_beli ?? null,
      });
    } else {
      reset({
        nama: "", penyedia: "", biaya: 0, tanggal_beli: "",
        status: "Belum Mulai", kategori: "Crypto", asal: "Lokal", catatan_insight: "", link: "", rating: null,
        urutan_beli: null,
      });
    }
  }, [editingCourse, open, isUSD, rate, reset]);

  const onFormSubmit = (values: CourseFormValues) => {
    if (!values.nama) return;
    const biayaInIdr = isUSD ? values.biaya * rate : values.biaya;
    onSubmit({ ...values, biaya: Math.round(biayaInIdr) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#f0f7fa] text-[#0074a6]">
              <BookOpen size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900">
              {editingCourse ? t("learning.editCourse") : t("learning.addCourseNew")}
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            {t("learning.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("learning.courseNameLabel")}</label>
            <Input
              {...register("nama")}
              placeholder={t("learning.courseNamePlaceholder")}
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("learning.providerLabel")}</label>
              <Input
                {...register("penyedia")}
                placeholder={t("learning.providerPlaceholder")}
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {t("learning.costLabel")} <span className="text-slate-400 font-normal">({currency})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none font-medium">
                  {isUSD ? "$" : "Rp"}
                </span>
                <FormattedNumberInput
                  value={biayaDisplay}
                  onChange={(v) => setValue("biaya", v ?? 0)}
                  decimals={isUSD ? 2 : 0}
                  locale={isUSD ? "en-US" : "id-ID"}
                  placeholder={isUSD ? "0.00" : "0"}
                  className="bg-white border-slate-200 text-slate-900 pl-9 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("learning.buyDateLabel")}</label>
              <Input
                type="date"
                {...register("tanggal_beli")}
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {t("learning.orderLabel")} <span className="text-slate-400 font-normal">{t("learning.orderHint")}</span>
              </label>
              <Input
                type="number"
                min={1}
                placeholder={t("learning.orderPlaceholder")}
                {...register("urutan_beli", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("common.status")}</label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as LearningStatus)}>
                <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900 focus:ring-[#0074a6]/30 focus:border-[#0074a6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Mulai">{t("learning.statusNotStarted")}</SelectItem>
                  <SelectItem value="Sedang Berjalan">{t("learning.statusInProgress")}</SelectItem>
                  <SelectItem value="Selesai">{t("learning.statusCompleted")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("learning.originLabel")}</label>
              <Select value={watch("asal")} onValueChange={(v) => setValue("asal", v as LearningOrigin)}>
                <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900 focus:ring-[#0074a6]/30 focus:border-[#0074a6]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lokal">{t("learning.categoryLocal")}</SelectItem>
                  <SelectItem value="Luar">{t("learning.categoryInternational")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("learning.category")}</label>
            <Select value={watch("kategori")} onValueChange={(v) => setValue("kategori", v as LearningCategory)}>
              <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900 focus:ring-[#0074a6]/30 focus:border-[#0074a6]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crypto">{t("learning.categoryCrypto")}</SelectItem>
                <SelectItem value="Saham">{t("learning.categorySaham")}</SelectItem>
                <SelectItem value="Forex">{t("learning.categoryForex")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-100" />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("learning.notesInsightLabel")}</label>
            <textarea
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0074a6] focus:ring-3 focus:ring-[#0074a6]/20 resize-none transition-colors"
              rows={3}
              placeholder={t("learning.notesInsightPlaceholder")}
              {...register("catatan_insight")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("learning.linkLabel")}</label>
            <Input
              {...register("link")}
              type="url"
              placeholder={t("learning.linkPlaceholder")}
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
            />
          </div>
        </form>

        <DialogFooter className="gap-2 pt-2 sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm">
          <DialogClose render={<Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium" />}>
            {t("common.cancel")}
          </DialogClose>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            className="bg-[#005274] hover:bg-[#003d57] text-white font-medium px-5 shadow-sm"
          >
            {editingCourse ? t("common.save") : t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
