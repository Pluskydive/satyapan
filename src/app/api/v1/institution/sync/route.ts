import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";
import { sanitizeRecordRow } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("X-AICTE-API-Key");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication failed: Missing API Key in Authorization header." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { institution_id, students } = body;

    if (!institution_id) {
      return NextResponse.json({ error: "institution_id parameter required." }, { status: 400 });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "students payload array required." }, { status: 400 });
    }

    // Sanitize records
    const cleanRows = students.map((s) => sanitizeRecordRow(s));

    const result = await dataProvider.uploadStudents(institution_id, cleanRows);

    return NextResponse.json({
      status: "SUCCESS",
      synchronized_records: result.inserted,
      engine_execution: "TRIGGERED",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process API synchronization." },
      { status: 500 }
    );
  }
}
