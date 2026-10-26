import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { sanitizeRecordRow } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawRows = body.rows;
    const institutionId = body.institution_id;

    if (!institutionId) {
      return NextResponse.json({ error: "Institution ID is required" }, { status: 400 });
    }

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return NextResponse.json({ error: "No student records provided" }, { status: 400 });
    }

    // Cybersecurity defense: sanitize against CSV formula injection
    const sanitizedRows = rawRows.map((r: any) => sanitizeRecordRow(r));

    const result = await dataProvider.uploadStudents(institutionId, sanitizedRows);

    return NextResponse.json({ inserted: result.inserted, mode: result.mode });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Student upload failed" }, { status: 500 });
  }
}
