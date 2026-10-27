import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { apiFailure, demoApiUnavailable } from "@/lib/api-utils";

export async function GET() {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    const { data } = await dataProvider.getOpenFlags();
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't load the review items. Please try again.");
  }
}
