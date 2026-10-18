// Literal `process.env.NEXT_PUBLIC_*` access is required so Next.js can inline these values.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Accept the newer "publishable" key name and the legacy "anon" key name.
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(url && key);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
      "(or NEXT_PUBLIC_SUPABASE_ANON_KEY). Auth and data features are disabled until then."
  );
}

// Placeholders keep client creation from throwing (e.g. during prerendering) when unconfigured.
export const supabaseUrl = url || "https://placeholder.supabase.co";
export const supabaseKey = key || "placeholder-key";
