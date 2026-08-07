import { NextResponse } from "next/server";
import { fetchGscSummary, getGscMissingEnv } from "@/lib/gsc";

export async function POST() {
  const missing = getGscMissingEnv();

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        source: "GSC",
        status: "not_configured",
        missing,
        message:
          "Search Console API credentials are not configured. Add the missing Vercel environment variables before syncing."
      },
      { status: 501 }
    );
  }

  try {
    const report = await fetchGscSummary();

    return NextResponse.json({
      ok: true,
      source: "GSC",
      status: "synced",
      report
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "GSC",
        status: "sync_failed",
        message: error instanceof Error ? error.message : "Search Console sync failed."
      },
      { status: 502 }
    );
  }
}
