"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoalCard from "@/features/goals/components/GoalCard";
import GoalDialog from "@/features/goals/components/GoalDialog";
import { useGoalsQuery, useCreateGoalMutation, useUpdateGoalMutation, useDeleteGoalMutation } from "@/features/goals/hooks/useGoalQuery";
import { Goal, GoalFormData } from "@/features/goals/types/goal";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoalCardSkeleton } from "@/components/shared/Skeleton";

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function GoalsPage() {
  const { t } = useLanguage();
  const { data: goals = [], isLoading } = useGoalsQuery();
  const createMutation = useCreateGoalMutation();
  const updateMutation = useUpdateGoalMutation();
  const deleteMutation = useDeleteGoalMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleAdd = () => { setEditingGoal(null); setDialogOpen(true); };
  const handleEdit = (g: Goal) => { setEditingGoal(g); setDialogOpen(true); };

  const handleDelete = async (id: string) => {
    if (confirm(t("goals.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("goals.title")}</h1>
            <p className="text-slate-500 mt-1">{t("goals.description")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <GoalCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("goals.title")}</h1>
          <p className="text-slate-500 mt-1">{t("goals.description")}</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#0074a6] hover:bg-[#005274] text-white">
          <Plus className="mr-2 h-4 w-4" /> {t("goals.addGoal")}
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {goals.map((goal) => (
          <motion.div key={goal.id} variants={cardItem} className="h-full">
            <GoalCard goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
          </motion.div>
        ))}
      </motion.div>

      {goals.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 text-center">
          <p className="text-slate-500">{t("goals.emptyDescription")}</p>
        </div>
      )}

      <GoalDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} editingGoal={editingGoal} />
    </div>
  );
}
