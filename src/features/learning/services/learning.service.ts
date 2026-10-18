import { createClient } from "@/supabase/client";
import { Course, CourseFormData } from "../types/learning";

export async function getCourses(): Promise<Course[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("kategori", { ascending: true })
    .order("urutan_beli", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error.message);
    return [];
  }

  return (data ?? []) as Course[];
}

export async function createCourse(data: CourseFormData): Promise<Course> {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;

  if (!userId) throw new Error("Not authenticated");

  const payload = { ...data, user_id: userId };
  if (!payload.tanggal_beli) payload.tanggal_beli = new Date().toISOString().slice(0, 10);

  const { data: course, error } = await supabase
    .from("courses")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating course:", error.message);
    throw error;
  }

  return course as Course;
}

export async function updateCourse(id: string, data: Partial<CourseFormData>): Promise<Course | null> {
  const supabase = createClient();
  const payload = { ...data };
  if ("tanggal_beli" in payload && !payload.tanggal_beli) payload.tanggal_beli = new Date().toISOString().slice(0, 10);
  const { data: course, error } = await supabase
    .from("courses")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating course:", error.message);
    return null;
  }

  return course as Course;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    console.error("Error deleting course:", error.message);
    return false;
  }

  return true;
}

export async function getTotalBiaya(): Promise<number> {
  const courses = await getCourses();
  return courses.reduce((s, c) => s + c.biaya, 0);
}
