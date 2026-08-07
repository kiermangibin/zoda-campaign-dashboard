import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/dashboard-summary";

export async function GET() {
  const summary = await getDashboardSummary();

  return NextResponse.json({
    ok: true,
    source: summary.source,
    funnel: summary.funnel
  });
}
