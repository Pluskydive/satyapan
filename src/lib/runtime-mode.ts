export type RuntimeMode = "demo" | "live" | "disabled";

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") return null;
  } catch {
    return null;
  }
  return { url, key };
}

/**
 * Live mode requires an explicit opt-in and valid public Supabase configuration.
 * Route handlers still enforce authentication, role checks, and database RLS.
 */
export function getRuntimeMode(): RuntimeMode {
  if (process.env.SATYAPAN_MODE === "demo") return "demo";
  if (process.env.SATYAPAN_MODE === "live" && getSupabasePublicConfig()) return "live";

  // Local development remains easy to start. Production must opt in explicitly.
  if (process.env.NODE_ENV === "development" && !process.env.SATYAPAN_MODE) {
    return "demo";
  }

  return "disabled";
}

export function assertDemoMode(): void {
  if (getRuntimeMode() !== "demo") {
    throw new Error("SATYAPAN_RUNTIME_DISABLED");
  }
}

export function isRuntimeDisabledError(error: unknown): boolean {
  return error instanceof Error && error.message === "SATYAPAN_RUNTIME_DISABLED";
}
