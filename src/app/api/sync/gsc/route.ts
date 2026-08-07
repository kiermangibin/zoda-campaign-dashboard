import { NextResponse } from "next/server";
import { fetchGscSummary, getGscMissingEnv } from "@/lib/gsc";
import { persistGscSummary } from "@/lib/sync-storage";

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
    const storage = await persistGscSummary(report);

    return NextResponse.json({
      ok: true,
      source: "GSC",
      status: "synced",
      storage,
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
