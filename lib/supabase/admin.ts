import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getServiceRoleKey, getSupabasePublicConfig } from "@/lib/env";

export function createAdminClient() {
  const config = getSupabasePublicConfig();
  const serviceKey = getServiceRoleKey();
  if (!config || !serviceKey) {
    throw new Error(
      "Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createSupabaseClient<Database>(config.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
