"use client";

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/shared/lib/supabase-env";

export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createSupabaseBrowserClient(url, publishableKey);
}
