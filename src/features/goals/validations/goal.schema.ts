import { z } from "zod";

export const goalFormSchema = z.object({
  nama: z.string().min(1, "Goal name is required"),
  kategori: z.enum(["Profit", "Portofolio", "Alokasi", "Pembelajaran", "Dream"]),
  target_nilai: z.number().min(0, "Target must be positive"),
  progress_saat_ini: z.number().min(0, "Progress must be positive"),
  deadline: z.string().nullable(),
  status: z.enum(["on_track", "tertinggal", "tercapai"]),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
