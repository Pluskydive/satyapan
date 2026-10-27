import { NextResponse } from "next/server";
import { readJsonBody, sameOriginFailure, RequestInputError } from "@/lib/api-utils";
import { getRuntimeMode } from "@/lib/runtime-mode";
import type { AppRole } from "@/lib/authz";

const ALLOWED_DEMO_ROLES: Array<AppRole | "public_verifier"> = [
  "platform_admin",
  "institution_admin",
  "institution_staff",
  "reviewer",
  "public_verifier",
];

export async function POST(request: Request) {
  if (getRuntimeMode() !== "demo") {
    return NextResponse.json(
      { error: "Demo persona switching is only available in demonstration mode." },
      { status: 400 }
    );
  }

  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  try {
    const body = await readJsonBody<{
      role?: unknown;
      email?: unknown;
      institution_id?: unknown;
    }>(request, 4000);

    const role = typeof body.role === "string" ? (body.role as AppRole | "public_verifier") : null;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const institutionId = typeof body.institution_id === "string" ? body.institution_id.trim() : "";

    if (!role || !ALLOWED_DEMO_ROLES.includes(role)) {
      throw new RequestInputError("Select a recognized demo stakeholder persona.");
    }

    const response = NextResponse.json(
      { success: true, role, email, institution_id: institutionId },
      { headers: { "Cache-Control": "private, no-store" } }
    );

    const cookieOptions = {
      path: "/",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
    };

    response.cookies.set("satyapan_demo_role", role, cookieOptions);
    response.cookies.set("satyapan_demo_email", email || "admin@satyapan.gov.in", cookieOptions);
    response.cookies.set("satyapan_demo_institution", institutionId, cookieOptions);

    return response;
  } catch (err) {
    const message = err instanceof RequestInputError ? err.message : "Failed to switch persona.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
