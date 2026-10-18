"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as goalService from "../services/goal.service";
import { GoalFormData } from "../types/goal";

export function useGoalsQuery() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: goalService.getGoals,
  });
}

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalFormData) => goalService.createGoal(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GoalFormData> }) => goalService.updateGoal(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });
}
