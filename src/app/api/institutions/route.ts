import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || undefined;
    const { data } = await dataProvider.getInstitutionSummary(id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch institutions" }, { status: 500 });
  }
}
