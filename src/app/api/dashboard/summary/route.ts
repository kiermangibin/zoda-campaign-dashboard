import { NextResponse } from "next/server";
import { getDashboardSummary, supportedRanges } from "@/data/mock-dashboard";
import type { RangeKey } from "@/types/dashboard";

export function GET(request: Request) {
  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range") as RangeKey | null;
  const range = requestedRange && supportedRanges.includes(requestedRange) ? requestedRange : "30d";
  const campaign = url.searchParams.get("campaign") || "all";

  return NextResponse.json(getDashboardSummary(range, campaign));
}
