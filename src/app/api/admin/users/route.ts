import { NextResponse } from "next/server";
import { requireRole, type AppRole } from "@/lib/authz";
import { apiFailure, demoApiUnavailable, readJsonBody, RequestInputError } from "@/lib/api-utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRuntimeMode } from "@/lib/runtime-mode";

const ASSIGNABLE_ROLES: AppRole[] = ["platform_admin", "institution_admin", "institution_staff", "reviewer"];
const PAGE_SIZE = 50;

const DEMO_ACCOUNTS = [
  {
    user_id: "usr-admin-1",
    email: "admin@satyapan.gov.in",
    is_email_verified: true,
    role: "platform_admin" as AppRole,
    institution_id: null,
    is_active: true,
    created_at: "2026-01-10T09:00:00Z",
    institutions: null,
  },
  {
    user_id: "usr-inst-1",
    email: "registrar@college1001.edu.in",
    is_email_verified: true,
    role: "institution_admin" as AppRole,
    institution_id: "inst-1001",
    is_active: true,
    created_at: "2026-02-15T10:30:00Z",
    institutions: { name: "Government Engineering College (Sample Inst. 1)" },
  },
  {
    user_id: "usr-inst-2",
    email: "staff@college1001.edu.in",
    is_email_verified: true,
    role: "institution_staff" as AppRole,
    institution_id: "inst-1001",
    is_active: true,
    created_at: "2026-03-01T11:15:00Z",
    institutions: { name: "Government Engineering College (Sample Inst. 1)" },
  },
  {
    user_id: "usr-auditor-1",
    email: "auditor@naac.gov.in",
    is_email_verified: true,
    role: "reviewer" as AppRole,
    institution_id: null,
    is_active: true,
    created_at: "2026-04-12T14:20:00Z",
    institutions: null,
  },
  {
    user_id: "usr-apex-1",
    email: "admissions@apex.edu.in",
    is_email_verified: false,
    role: "pending" as AppRole,
    institution_id: "inst-1002",
    is_active: false,
    created_at: "2026-10-20T16:45:00Z",
    institutions: { name: "Apex Engineering College" },
  },
];

function normalizeRole(value: unknown): AppRole | null {
  return typeof value === "string" && ASSIGNABLE_ROLES.includes(value as AppRole)
    ? (value as AppRole)
    : null;
}

function isInstitutionRole(role: AppRole) {
  return role === "institution_admin" || role === "institution_staff";
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function publicSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      const url = new URL(configured);
      if (process.env.NODE_ENV === "production" && url.protocol !== "https:") return null;
      return url.origin;
    } catch {
      return null;
    }
  }
  if (process.env.NODE_ENV !== "production") return new URL(request.url).origin;
  return null;
}

export async function GET(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    if (getRuntimeMode() === "demo") {
      const params = new URL(request.url).searchParams;
      const search = (params.get("q") || "").trim().toLowerCase();
      const filtered = DEMO_ACCOUNTS.filter((acc) => !search || acc.email.toLowerCase().includes(search));
      return NextResponse.json(
        { users: filtered, page: 1, page_size: PAGE_SIZE, has_more: false },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }
    await requireRole("platform_admin");
    if (getRuntimeMode() !== "live") {
      return NextResponse.json({ error: "User accounts are available only in live mode." }, { status: 404 });
    }
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Math.min(10_000, Number.parseInt(params.get("page") || "1", 10) || 1));
    const search = (params.get("q") || "").trim().slice(0, 80).replace(/[\%_]/g, "");
    const admin = createSupabaseAdminClient();
    let query = admin
      .from("user_profiles")
      .select("user_id,email,is_email_verified,role,institution_id,is_active,created_at,institutions(name)")
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (search) query = query.ilike("email", `%${search}%`);
    const { data, error } = await query;
    if (error || !data) throw new Error("USER_LIST_FAILED");
    return NextResponse.json(
      { users: data, page, page_size: PAGE_SIZE, has_more: data.length === PAGE_SIZE },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't load the user list. Please try again.");
  }
}

export async function POST(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    if (getRuntimeMode() === "demo") {
      const body = await readJsonBody<{ email?: unknown; role?: unknown; institution_id?: unknown }>(request, 8_000);
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const role = normalizeRole(body.role);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role) {
        throw new RequestInputError("Enter a valid work email and choose an account type.");
      }
      return NextResponse.json({ success: true, email, role, mode: "demo" }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
    const { user: actor } = await requireRole("platform_admin");
    if (getRuntimeMode() !== "live") {
      return NextResponse.json({ error: "User invitations are available only in live mode." }, { status: 404 });
    }
    const body = await readJsonBody<{ email?: unknown; role?: unknown; institution_id?: unknown }>(request, 8_000);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = normalizeRole(body.role);
    const institutionId = typeof body.institution_id === "string" ? body.institution_id : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !role) {
      throw new RequestInputError("Enter a valid work email and choose an account type.");
    }
    if (isInstitutionRole(role) ? !validUuid(institutionId) : Boolean(institutionId)) {
      throw new RequestInputError("Choose an institution for institution accounts. Other account types do not use one.");
    }

    const siteUrl = publicSiteUrl(request);
    if (!siteUrl) {
      return NextResponse.json({ error: "The site address is not configured for account invitations." }, { status: 503 });
    }

    const admin = createSupabaseAdminClient();
    const { data: existing, error: lookupError } = await admin
      .from("user_profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();
    if (lookupError) throw new Error("USER_LOOKUP_FAILED");
    if (existing) return NextResponse.json({ error: "An account already uses this email address." }, { status: 409 });

    if (isInstitutionRole(role)) {
      const { data: institution, error: institutionError } = await admin
        .from("institutions")
        .select("id")
        .eq("id", institutionId)
        .maybeSingle();
      if (institutionError || !institution) {
        throw new RequestInputError("Choose an institution that exists in the directory.");
      }
    }

    const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/account/password")}`,
    });
    if (inviteError || !invitation.user) {
      return NextResponse.json({ error: "We couldn't send this invitation. Check the address or contact support." }, { status: 409 });
    }

    // The Auth trigger creates an inactive pending profile. If assignment fails,
    // that profile remains unable to access records and the new Auth user is removed.
    const { data: assignment, error: profileError } = await admin.rpc("manage_sat_user", {
      p_actor_id: actor.id,
      p_user_id: invitation.user.id,
      p_role: role,
      p_institution_id: isInstitutionRole(role) ? institutionId : null,
      p_is_active: true,
    });
    if (profileError || assignment !== "ok") {
      await admin.auth.admin.deleteUser(invitation.user.id);
      return NextResponse.json({ error: "We couldn't finish setting up this account. No access was granted." }, { status: 500 });
    }

    return NextResponse.json({ success: true, email, role }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't create this invitation. Please try again.");
  }
}

export async function PATCH(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    if (getRuntimeMode() === "demo") {
      const body = await readJsonBody<{ user_id?: unknown; role?: unknown; is_active?: unknown }>(request, 8_000);
      if (!body.user_id || !normalizeRole(body.role)) {
        throw new RequestInputError("Check the account details and try again.");
      }
      return NextResponse.json({ success: true, mode: "demo" }, { headers: { "Cache-Control": "no-store" } });
    }
    const { user } = await requireRole("platform_admin");
    if (getRuntimeMode() !== "live") {
      return NextResponse.json({ error: "User management is available only in live mode." }, { status: 404 });
    }
    const body = await readJsonBody<{
      user_id?: unknown;
      role?: unknown;
      institution_id?: unknown;
      is_active?: unknown;
    }>(request, 8_000);
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const role = normalizeRole(body.role);
    const institutionId = typeof body.institution_id === "string" ? body.institution_id : "";
    if (!validUuid(userId) || !role || typeof body.is_active !== "boolean") {
      throw new RequestInputError("Check the account details and try again.");
    }
    if (userId === user.id) {
      throw new RequestInputError("Ask another platform administrator to change your own access.");
    }
    if (isInstitutionRole(role) ? !validUuid(institutionId) : Boolean(institutionId)) {
      throw new RequestInputError("Choose an institution for institution accounts. Other account types do not use one.");
    }

    const admin = createSupabaseAdminClient();
    const { data: updateResult, error: updateError } = await admin.rpc("manage_sat_user", {
      p_actor_id: user.id,
      p_user_id: userId,
      p_role: role,
      p_institution_id: isInstitutionRole(role) ? institutionId : null,
      p_is_active: body.is_active,
    });
    if (updateError) throw new Error("USER_UPDATE_FAILED");
    const knownErrors: Record<string, { status: number; message: string }> = {
      access_denied: { status: 403, message: "You don't have access to this action." },
      self_change: { status: 400, message: "Ask another platform administrator to change your own access." },
      invalid_role: { status: 400, message: "Choose a permitted account type." },
      invalid_scope: { status: 400, message: "Choose an institution for institution accounts only." },
      institution_not_found: { status: 400, message: "Choose an institution that exists in the directory." },
      user_not_found: { status: 404, message: "That account could not be found." },
      last_platform_admin: { status: 409, message: "Keep at least one active platform administrator." },
    };
    const knownError = typeof updateResult === "string" ? knownErrors[updateResult] : undefined;
    if (knownError) return NextResponse.json({ error: knownError.message }, { status: knownError.status });
    if (updateResult !== "ok") throw new Error("USER_UPDATE_FAILED");

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't update this account. Please try again.");
  }
}
