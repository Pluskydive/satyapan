import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthorizationError } from "@/lib/authz";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { sameOriginFailure } from "@/lib/api-utils";

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  if (getRuntimeMode() === "demo") {
    const response = NextResponse.json(
      { success: true, mode: "demo" },
      { headers: { "Cache-Control": "private, no-store" } }
    );
    response.cookies.delete("satyapan_demo_role");
    response.cookies.delete("satyapan_demo_email");
    response.cookies.delete("satyapan_demo_institution");
    return response;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return NextResponse.json({ error: "We couldn't end this session. Please try again." }, { status: 503 });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AuthorizationError) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "We couldn't end this session. Please try again." }, { status: 503 });
  }
}
