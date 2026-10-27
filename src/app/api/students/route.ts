import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { apiFailure, demoApiUnavailable } from "@/lib/api-utils";

const VALID_STATUSES = new Set(["ALL", "VERIFIED", "FLAGGED", "PENDING_APAAR_VALIDATION"]);

export async function GET(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    const params = new URL(request.url).searchParams;
    const institutionId = params.get("institution_id")?.slice(0, 80) || undefined;
    const limit = Math.max(1, Math.min(100, Number.parseInt(params.get("limit") || "50", 10) || 50));
    const offset = Math.max(0, Math.min(1_000_000, Number.parseInt(params.get("offset") || "0", 10) || 0));
    const search = (params.get("q") || "").slice(0, 80);
    const requestedStatus = (params.get("status") || "ALL").toUpperCase();
    const status = VALID_STATUSES.has(requestedStatus) ? requestedStatus : "ALL";
    const result = await dataProvider.getInstitutionStudents(institutionId, limit, offset, search, status);
    return NextResponse.json(
      { students: result.data, total: result.total, limit, offset, mode: result.mode },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't load these records. Please try again.");
  }
}
