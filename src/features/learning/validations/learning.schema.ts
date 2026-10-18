import { z } from "zod";

export const courseFormSchema = z.object({
  nama: z.string().min(1, "Course name is required"),
  penyedia: z.string(),
  biaya: z.number().min(0, "Cost must be positive"),
  tanggal_beli: z.string(),
  status: z.enum(["Belum Mulai", "Sedang Berjalan", "Selesai"]),
  kategori: z.enum(["Crypto", "Saham", "Forex"]),
  asal: z.enum(["Lokal", "Luar"]),
  catatan_insight: z.string(),
  link: z.string(),
  rating: z.number().nullable(),
  urutan_beli: z.number().int().min(1).nullable(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
