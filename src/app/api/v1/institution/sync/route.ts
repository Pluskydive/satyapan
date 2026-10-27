import { NextResponse } from "next/server";
import { demoApiUnavailable } from "@/lib/api-utils";

/**
 * Institution integrations are intentionally disabled. The previous prototype
 * accepted any non-empty header as an API key and could ingest unauthenticated data.
 */
export async function POST() {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;

  return NextResponse.json(
    { error: "Institution system connections are not enabled in this prototype." },
    { status: 501, headers: { "Cache-Control": "no-store" } }
  );
}
