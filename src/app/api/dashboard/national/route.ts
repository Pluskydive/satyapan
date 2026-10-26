import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await dataProvider.getNationalSummary();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch national summary" }, { status: 500 });
  }
}
