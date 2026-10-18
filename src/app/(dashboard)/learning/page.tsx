"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, GraduationCap, BookOpen, DollarSign, CheckCircle, Bitcoin, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StatsCard from "@/features/dashboard/components/StatsCard";
import CourseList from "@/features/learning/components/CourseList";
import CourseDialog from "@/features/learning/components/CourseDialog";
import { useCoursesQuery, useTotalBiayaQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } from "@/features/learning/hooks/useCourseQuery";
import { Course, CourseFormData, LearningCategory } from "@/features/learning/types/learning";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import Loading from "@/components/shared/Loading";

type FilterTab = "Semua" | LearningCategory;

export default function LearningPage() {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();
  const { data: courses = [], isLoading } = useCoursesQuery();
  const { data: totalBiaya = 0 } = useTotalBiayaQuery();
  const createMutation = useCreateCourseMutation();
  const updateMutation = useUpdateCourseMutation();
  const deleteMutation = useDeleteCourseMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");

  const filteredCourses = useMemo(() => {
    if (activeFilter === "Semua") return courses;
    return courses.filter((c) => (c.kategori ?? "Crypto") === activeFilter);
  }, [courses, activeFilter]);

  const cryptoCourses = useMemo(() => courses.filter((c) => (c.kategori ?? "Crypto") === "Crypto"), [courses]);
  const sahamCourses = useMemo(() => courses.filter((c) => c.kategori === "Saham"), [courses]);
  const forexCourses = useMemo(() => courses.filter((c) => c.kategori === "Forex"), [courses]);

  const totalBiayaCrypto = useMemo(() => cryptoCourses.reduce((s, c) => s + c.biaya, 0), [cryptoCourses]);
  const totalBiayaSaham = useMemo(() => sahamCourses.reduce((s, c) => s + c.biaya, 0), [sahamCourses]);
  const totalBiayaForex = useMemo(() => forexCourses.reduce((s, c) => s + c.biaya, 0), [forexCourses]);

  const completedCount = courses.filter((c) => c.status === "Selesai").length;
  const inProgressCount = courses.filter((c) => c.status === "Sedang Berjalan").length;

  const handleAdd = () => { setEditingCourse(null); setDialogOpen(true); };
  const handleEdit = (c: Course) => { setEditingCourse(c); setDialogOpen(true); };
  const handleDelete = (id: string) => {
    if (confirm(t("learning.deleteConfirm"))) deleteMutation.mutate(id);
  };
  const handleSubmit = (data: CourseFormData) => {
    if (editingCourse) { updateMutation.mutate({ id: editingCourse.id, data }); }
    else { createMutation.mutate(data); }
    setDialogOpen(false);
  };

  if (isLoading) return <Loading />;

  const conv = (v: number) => currency === "USD" ? Math.round(v / rate) : v;
  const currencyPrefix = currency === "IDR" ? "Rp " : "$ ";

  const filterTabs: { value: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { value: "Semua", label: t("learning.filterAll"), icon: <BookOpen size={14} />, count: courses.length },
    { value: "Crypto", label: t("learning.categoryCrypto"), icon: <Bitcoin size={14} />, count: cryptoCourses.length },
    { value: "Saham", label: t("learning.categorySaham"), icon: <Coins size={14} />, count: sahamCourses.length },
    { value: "Forex", label: t("learning.categoryForex"), icon: <DollarSign size={14} />, count: forexCourses.length },
  ];

  return (
    <motion.div
      className="space-y-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f0f7fa] text-[#0074a6]">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("learning.title")}</h1>
              <p className="text-slate-500 mt-0.5">{t("learning.description")}</p>
            </div>
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-[#005274] hover:bg-[#003d57] text-white font-medium px-5">
          <Plus className="mr-2 h-4 w-4" /> {t("learning.addCourse")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title={t("learning.totalCourses")}
          value={String(courses.length)}
          subtitle={`${inProgressCount} ${t("learning.statusInProgress").toLowerCase()}`}
          icon={<BookOpen size={20} />}
          iconBg="bg-[#f0f7fa]"
          iconColor="text-[#0074a6]"
          valueColor="text-[#005274]"
        />
        <StatsCard
          title={t("learning.totalInvestment")}
          value=""
          numericValue={conv(totalBiaya)}
          valuePrefix={currencyPrefix}
          subtitle={t("learning.totalInvestment")}
          icon={<DollarSign size={20} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          valueColor="text-amber-600"
        />
        <StatsCard
          title={`${t("learning.categoryCrypto")} (${cryptoCourses.length})`}
          value=""
          numericValue={conv(totalBiayaCrypto)}
          valuePrefix={currencyPrefix}
          subtitle={t("learning.totalInvestment")}
          icon={<Bitcoin size={20} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          valueColor="text-orange-600"
        />
        <StatsCard
          title={`${t("learning.categorySaham")} (${sahamCourses.length})`}
          value=""
          numericValue={conv(totalBiayaSaham)}
          valuePrefix={currencyPrefix}
          subtitle={t("learning.totalInvestment")}
          icon={<Coins size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          valueColor="text-blue-600"
        />
        <StatsCard
          title={`${t("learning.categoryForex")} (${forexCourses.length})`}
          value=""
          numericValue={conv(totalBiayaForex)}
          valuePrefix={currencyPrefix}
          subtitle={t("learning.totalInvestment")}
          icon={<DollarSign size={20} />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
      </div>

      {courses.length > 0 && (
        <div className="flex items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeFilter === tab.value
                  ? "bg-[#005274] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {tab.icon}
              {tab.label}
              <span className={cn(
                "ml-0.5 text-xs px-1.5 py-0.5 rounded-full",
                activeFilter === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 w-fit mx-auto mb-5">
            <GraduationCap className="h-10 w-10 text-slate-400" />
          </div>
          <p className="text-slate-900 font-semibold text-lg mb-1">{t("learning.title")}</p>
          <p className="text-slate-500 text-sm mb-5">{t("learning.emptyDescription")}</p>
          <Button onClick={handleAdd} className="bg-[#005274] hover:bg-[#003d57] text-white font-medium">
            <Plus className="mr-2 h-4 w-4" /> {t("learning.addCourse")}
          </Button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="p-3 rounded-xl bg-slate-50 w-fit mx-auto mb-4">
            {activeFilter === "Crypto" ? <Bitcoin className="h-8 w-8 text-slate-400" /> : activeFilter === "Forex" ? <DollarSign className="h-8 w-8 text-slate-400" /> : <Coins className="h-8 w-8 text-slate-400" />}
          </div>
          <p className="text-slate-900 font-semibold mb-1">{t("learning.emptyFilterTitle")}</p>
          <p className="text-slate-500 text-sm">{t("learning.emptyFilterDescription")}</p>
        </div>
      ) : (
        <CourseList courses={filteredCourses} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <CourseDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} editingCourse={editingCourse} />
    </motion.div>
  );
}
