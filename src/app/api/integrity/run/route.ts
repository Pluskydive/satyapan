import { NextResponse } from "next/server";
import { dataProvider } from "@/lib/supabase";

export async function POST() {
  try {
    const result = await dataProvider.runIntegrityChecks();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Integrity run failed" }, { status: 500 });
  }
}
