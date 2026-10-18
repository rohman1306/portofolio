export type GoalCategory = "Profit" | "Portofolio" | "Alokasi" | "Pembelajaran" | "Dream";
export type GoalStatus = "on_track" | "tertinggal" | "tercapai";

export interface Goal {
  id: string;
  nama: string;
  kategori: GoalCategory;
  target_nilai: number;
  progress_saat_ini: number;
  deadline: string | null;
  status: GoalStatus;
  created_at: string;
}

export type GoalFormData = Omit<Goal, "id" | "created_at">;
