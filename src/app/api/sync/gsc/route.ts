import { NextResponse } from "next/server";
import { syncNotConfigured } from "@/lib/env";

export async function POST() {
  const missing = syncNotConfigured("GSC", ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GSC_SITE_URL"]);

  if (missing) {
    return NextResponse.json(missing, { status: 501 });
  }

  return NextResponse.json({
    ok: false,
    source: "GSC",
    status: "not_implemented",
    message: "Search Console sync contract is ready. Implement Search Console API fetch once credentials are approved."
  }, { status: 501 });
}
