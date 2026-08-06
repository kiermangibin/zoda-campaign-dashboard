import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/data/mock-dashboard";

export function GET() {
  return NextResponse.json({
    ok: true,
    funnel: getDashboardSummary().funnel
  });
}
