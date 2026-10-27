"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/runtime-mode";

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("SATYAPAN_AUTH_NOT_CONFIGURED");
  return createBrowserClient(config.url, config.key);
}
