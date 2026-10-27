import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { apiFailure, demoApiUnavailable } from "@/lib/api-utils";

export async function GET(request: Request) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || undefined;
    const { data } = await dataProvider.getInstitutionSummary(id);
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't load the institution list. Please try again.");
  }
}
