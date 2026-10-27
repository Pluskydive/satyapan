import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole =
  | "platform_admin"
  | "institution_admin"
  | "institution_staff"
  | "reviewer"
  | "pending";

export interface UserProfile {
  user_id: string;
  email: string;
  role: AppRole;
  institution_id: string | null;
  is_active: boolean;
}

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(status === 401 ? "SATYAPAN_AUTH_REQUIRED" : "SATYAPAN_ACCESS_DENIED");
  }
}

export class AuthenticationServiceError extends Error {
  constructor() {
    super("SATYAPAN_AUTH_SERVICE_UNAVAILABLE");
  }
}

export async function getCurrentUserContext() {
  const supabase = await createSupabaseServerClient();
  let authResult;
  try {
    authResult = await supabase.auth.getUser();
  } catch {
    throw new AuthenticationServiceError();
  }
  const { data: { user }, error: userError } = authResult;
  if (userError || !user) throw new AuthorizationError(401);

  let profileResult;
  try {
    profileResult = await supabase
      .from("user_profiles")
      .select("user_id,email,role,institution_id,is_active")
      .eq("user_id", user.id)
      .maybeSingle();
  } catch {
    throw new AuthenticationServiceError();
  }
  const { data: profile, error: profileError } = profileResult;

  if (profileError) throw new AuthenticationServiceError();
  if (!profile || !profile.is_active || profile.role === "pending") {
    throw new AuthorizationError(403);
  }

  return {
    supabase,
    user: { id: user.id, email: user.email ?? "" },
    profile: profile as UserProfile,
  };
}

export async function requireRole(...allowedRoles: AppRole[]) {
  const context = await getCurrentUserContext();
  if (!allowedRoles.includes(context.profile.role)) throw new AuthorizationError(403);
  return context;
}

export function canManageUsers(profile: UserProfile) {
  return profile.role === "platform_admin";
}
