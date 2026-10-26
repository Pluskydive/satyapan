import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { data } = await dataProvider.getStudentById(id);
    if (!data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch student record" },
      { status: 500 }
    );
  }
}
