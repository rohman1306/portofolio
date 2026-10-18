"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHoldings, createHolding, updateHolding, deleteHolding } from "../services/holding.service";
import { HoldingFormData } from "../types/holding";

export function useHoldingsQuery() {
  return useQuery({
    queryKey: ["holdings"],
    queryFn: getHoldings,
  });
}

export function useCreateHoldingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HoldingFormData) => createHolding(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holdings"] }),
  });
}

export function useUpdateHoldingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HoldingFormData> }) => updateHolding(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holdings"] }),
  });
}

export function useDeleteHoldingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHolding(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holdings"] }),
  });
}
