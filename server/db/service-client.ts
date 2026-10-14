import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceConfig } from "@/shared/lib/supabase-env";

export function createServiceClient() {
  const { url, serviceRoleKey } = getSupabaseServiceConfig();

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
