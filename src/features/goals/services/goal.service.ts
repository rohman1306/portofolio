import { createClient } from "@/supabase/client";
import { Goal, GoalFormData } from "../types/goal";

export async function getGoals(): Promise<Goal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error.message);
    return [];
  }

  return (data ?? []) as Goal[];
}

export async function createGoal(data: GoalFormData): Promise<Goal> {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;

  if (!userId) throw new Error("Not authenticated");

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error creating goal:", error.message);
    throw error;
  }

  return goal as Goal;
}

export async function updateGoal(id: string, data: Partial<GoalFormData>): Promise<Goal | null> {
  const supabase = createClient();
  const { data: goal, error } = await supabase
    .from("goals")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating goal:", error.message);
    return null;
  }

  return goal as Goal;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);

  if (error) {
    console.error("Error deleting goal:", error.message);
    return false;
  }

  return true;
}

export function getGoalCategories() {
  return ["Profit", "Portofolio", "Alokasi", "Pembelajaran", "Dream"] as const;
}
