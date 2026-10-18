"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactionsByHoldingId,
  getAllTransactions,
  createTransaction,
  updateTransaction,
} from "../services/transaction.service";
import { TransactionFormData } from "../types/transaction";

export function useTransactionsQuery(holdingId: string | null) {
  return useQuery({
    queryKey: ["transactions", holdingId],
    queryFn: () => (holdingId ? getTransactionsByHoldingId(holdingId) : Promise.resolve([])),
    enabled: !!holdingId,
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionFormData) => createTransaction(data),
    onSuccess: (_tx, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.holding_id] });
      queryClient.invalidateQueries({ queryKey: ["allTransactions"] });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["allTransactions"] });
    },
  });
}

export function useAllTransactionsQuery() {
  return useQuery({
    queryKey: ["allTransactions"],
    queryFn: () => getAllTransactions(),
  });
}
