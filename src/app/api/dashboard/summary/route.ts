import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/dashboard-summary";
import type { RangeKey } from "@/types/dashboard";

const supportedRanges: RangeKey[] = ["7d", "30d", "90d"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range") as RangeKey | null;
  const range = requestedRange && supportedRanges.includes(requestedRange) ? requestedRange : "30d";

  return NextResponse.json(await getDashboardSummary(range));
}
