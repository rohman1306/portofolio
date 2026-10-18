import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseKey } from "@/supabase/env";
import type { Database } from "@/supabase/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
            if (headers) {
              Object.entries(headers).forEach(([key, value]) => {
                cookieStore.set(key, value, {
                  httpOnly: false,
                  secure: false,
                  path: "/",
                });
              });
            }
          } catch {
            // Server Component — ignore, proxy handles this
          }
        },
      },
    }
  );
}
