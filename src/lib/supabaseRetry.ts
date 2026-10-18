import { createClient } from "@/supabase/client";

export function isJwtError(error: { message?: string } | null): boolean {
  return Boolean(error?.message?.includes("JWT"));
}

export async function withJwtRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("JWT")) {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
      throw new Error("Session expired, redirecting to login...");
    }
    throw err;
  }
}