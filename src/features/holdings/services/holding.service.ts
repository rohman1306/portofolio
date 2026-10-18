import { createClient } from "@/supabase/client";
import { withJwtRetry } from "@/lib/supabaseRetry";
import { Holding, HoldingCategory } from "../types/holding";

export async function getHoldings(): Promise<Holding[]> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("holdings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching holdings:", error.message);
      return [];
    }

    return (data ?? []) as Holding[];
  });
}

export async function getHoldingById(id: string): Promise<Holding | undefined> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("holdings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching holding:", error.message);
      return undefined;
    }

    return data as Holding;
  });
}

export async function createHolding(
  data: Omit<Holding, "id" | "created_at" | "updated_at">
): Promise<Holding> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;

    if (!userId) throw new Error("Not authenticated");

    const { data: holding, error } = await supabase
      .from("holdings")
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Error creating holding:", error.message);
      throw error;
    }

    return holding as Holding;
  });
}

export async function updateHolding(
  id: string,
  data: Partial<Omit<Holding, "id" | "created_at" | "updated_at">>
): Promise<Holding | null> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data: holding, error } = await supabase
      .from("holdings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating holding:", error.message);
      return null;
    }

    return holding as Holding;
  });
}

export async function deleteHolding(id: string): Promise<boolean> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { error } = await supabase.from("holdings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting holding:", error.message);
      return false;
    }

    return true;
  });
}

export function getHoldingCategories(): HoldingCategory[] {
  return ["Saham", "Crypto", "ETF", "Reksadana", "Lainnya"];
}
