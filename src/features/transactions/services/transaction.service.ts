import { createClient } from "@/supabase/client";
import { withJwtRetry } from "@/lib/supabaseRetry";
import { Transaction, TransactionFormData } from "../types/transaction";

export async function getTransactionsByHoldingId(holdingId: string): Promise<Transaction[]> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("holding_id", holdingId)
      .order("tanggal", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error.message);
      return [];
    }
    return (data ?? []) as Transaction[];
  });
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all transactions:", error.message);
      return [];
    }
    return (data ?? []) as Transaction[];
  });
}

export async function createTransaction(data: TransactionFormData): Promise<Transaction | null> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const { data: tx, error } = await supabase
      .from("transactions")
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error.message);
      return null;
    }
    return tx as Transaction;
  });
}

export async function updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction | null> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { data: tx, error } = await supabase
      .from("transactions")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error.message);
      return null;
    }
    return tx as Transaction;
  });
}

export async function deleteTransactionsByHoldingId(holdingId: string): Promise<boolean> {
  return withJwtRetry(async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("holding_id", holdingId);

    if (error) {
      console.error("Error deleting transactions:", error.message);
      return false;
    }
    return true;
  });
}