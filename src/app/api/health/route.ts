import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "zoda-campaign-dashboard",
    status: "healthy"
  });
}
