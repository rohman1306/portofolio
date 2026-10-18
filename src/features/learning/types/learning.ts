export type LearningStatus = "Belum Mulai" | "Sedang Berjalan" | "Selesai";
export type LearningCategory = "Crypto" | "Saham" | "Forex";
export type LearningOrigin = "Lokal" | "Luar";

export interface Course {
  id: string;
  nama: string;
  penyedia: string;
  biaya: number;
  tanggal_beli: string;
  status: LearningStatus;
  kategori: LearningCategory;
  asal: LearningOrigin;
  catatan_insight: string;
  link: string;
  rating: number | null;
  urutan_beli: number | null;
  created_at: string;
}

export type CourseFormData = Omit<Course, "id" | "created_at">;
