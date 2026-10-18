import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/supabase/env";
import type { Database } from "@/supabase/database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
  return client;
}
