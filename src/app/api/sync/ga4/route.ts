import { NextResponse } from "next/server";
import { syncNotConfigured } from "@/lib/env";

export async function POST() {
  const missing = syncNotConfigured("GA4", ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GA4_PROPERTY_ID"]);

  if (missing) {
    return NextResponse.json(missing, { status: 501 });
  }

  return NextResponse.json({
    ok: false,
    source: "GA4",
    status: "not_implemented",
    message: "GA4 sync contract is ready. Implement Google Analytics Data API fetch once credentials are approved."
  }, { status: 501 });
}
