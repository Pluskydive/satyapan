import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/runtime-mode";

export function createSupabaseAdminClient() {
  const config = getSupabasePublicConfig();
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !secret) throw new Error("SATYAPAN_USER_ADMIN_NOT_CONFIGURED");

  return createClient(config.url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
