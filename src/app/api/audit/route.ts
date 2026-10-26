import { NextResponse } from "next/server";
import { getSatyapanStore } from "@/lib/mockData";

export async function GET() {
  try {
    const store = getSatyapanStore();
    return NextResponse.json(store.auditLogs);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
