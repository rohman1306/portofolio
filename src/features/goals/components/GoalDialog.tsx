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
import FormattedNumberInput from "@/components/shared/FormattedNumberInput";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Goal, GoalFormData, GoalCategory, GoalStatus } from "../types/goal";
import { getGoalCategories } from "../services/goal.service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { goalFormSchema, type GoalFormValues } from "../validations/goal.schema";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => void;
  editingGoal?: Goal | null;
}

export default function GoalDialog({ open, onOpenChange, onSubmit, editingGoal }: GoalDialogProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const isUSD = currency === "USD";
  const symbol = isUSD ? "$" : "Rp";
  const decimals = isUSD ? 2 : 0;
  const locale = isUSD ? "en-US" : "id-ID";

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      nama: "",
      kategori: "Profit",
      target_nilai: 0,
      progress_saat_ini: 0,
      deadline: null,
      status: "on_track",
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = form;
  const categories = getGoalCategories();
  const targetDisplay = watch("target_nilai");
  const progressDisplay = watch("progress_saat_ini");

  useEffect(() => {
    if (editingGoal) {
      reset({
        nama: editingGoal.nama,
        kategori: editingGoal.kategori,
        target_nilai: isUSD ? editingGoal.target_nilai / rate : editingGoal.target_nilai,
        progress_saat_ini: isUSD ? editingGoal.progress_saat_ini / rate : editingGoal.progress_saat_ini,
        deadline: editingGoal.deadline,
        status: editingGoal.status,
      });
    } else {
      reset({
        nama: "", kategori: "Profit", target_nilai: 0,
        progress_saat_ini: 0, deadline: null, status: "on_track",
      });
    }
  }, [editingGoal, open, isUSD, rate, reset]);

  const onFormSubmit = (values: GoalFormValues) => {
    if (!values.nama) return;
    const targetInIdr = isUSD ? Math.round(values.target_nilai * rate) : Math.round(values.target_nilai);
    const progressInIdr = isUSD ? Math.round(values.progress_saat_ini * rate) : Math.round(values.progress_saat_ini);
    onSubmit({ ...values, target_nilai: targetInIdr, progress_saat_ini: progressInIdr });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingGoal ? t("goals.editGoal") : t("goals.addGoalNew")}</DialogTitle>
          <DialogDescription>{t("goals.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("goals.goalNameLabel")}</label>
            <Input {...register("nama")} placeholder={t("goals.goalNamePlaceholder")} className="bg-card border-border" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("common.category")}</label>
              <Select value={watch("kategori")} onValueChange={(v) => setValue("kategori", v as GoalCategory)}>
                <SelectTrigger className="w-full bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("common.status")}</label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as GoalStatus)}>
                <SelectTrigger className="w-full bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_track">{t("goals.statusOnTrack")}</SelectItem>
                  <SelectItem value="tertinggal">{t("goals.statusBehind")}</SelectItem>
                  <SelectItem value="tercapai">{t("goals.statusAchieved")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("goals.targetValueLabel")} <span className="text-muted-foreground/60">({currency})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{symbol}</span>
                <FormattedNumberInput value={targetDisplay}
                  onChange={(v) => setValue("target_nilai", v ?? 0)} decimals={decimals} locale={locale}
                  placeholder={isUSD ? "0.00" : "0"} className="bg-card border-border pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("goals.currentProgressLabel")} <span className="text-muted-foreground/60">({currency})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{symbol}</span>
                <FormattedNumberInput value={progressDisplay}
                  onChange={(v) => setValue("progress_saat_ini", v ?? 0)} decimals={decimals} locale={locale}
                  placeholder={isUSD ? "0.00" : "0"} className="bg-card border-border pl-9" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("goals.deadlineLabel")}</label>
            <Input type="date" value={watch("deadline") ?? ""}
              onChange={(e) => setValue("deadline", e.target.value || null)}
              className="bg-card border-border" />
          </div>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
          <Button onClick={handleSubmit(onFormSubmit)} className="bg-blue-600 hover:bg-blue-700">
            {editingGoal ? t("common.save") : t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
