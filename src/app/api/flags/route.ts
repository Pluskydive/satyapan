import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await dataProvider.getOpenFlags();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch validation flags" }, { status: 500 });
  }
}
