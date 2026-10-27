import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { apiFailure, demoApiUnavailable, sameOriginFailure } from "@/lib/api-utils";

export async function POST(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;
  try {
    const result = await dataProvider.runIntegrityChecks();
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't complete the review run. Please try again.");
  }
}
