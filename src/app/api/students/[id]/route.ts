import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { apiFailure, demoApiUnavailable } from "@/lib/api-utils";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const unavailable = demoApiUnavailable();
  if (unavailable) return unavailable;
  try {
    const { id } = await context.params;
    const { data } = await dataProvider.getStudentById(id);
    if (!data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    return apiFailure(error, "We couldn't load this student record. Please try again.");
  }
}
