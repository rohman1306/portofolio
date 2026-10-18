"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as learningService from "../services/learning.service";
import { CourseFormData } from "../types/learning";

export function useCoursesQuery() {
  return useQuery({
    queryKey: ["courses", "v2"],
    queryFn: learningService.getCourses,
  });
}

export function useTotalBiayaQuery() {
  return useQuery({
    queryKey: ["courses", "v2", "total-biaya"],
    queryFn: learningService.getTotalBiaya,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseFormData) => learningService.createCourse(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseFormData> }) => learningService.updateCourse(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => learningService.deleteCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}
