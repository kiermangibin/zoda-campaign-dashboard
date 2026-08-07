import { NextResponse } from "next/server";
import { fetchGa4Summary, getGa4MissingEnv } from "@/lib/ga4";
import { persistGa4Summary } from "@/lib/sync-storage";

export async function POST() {
  const missing = getGa4MissingEnv();

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        source: "GA4",
        status: "not_configured",
        missing,
        message:
          "GA4 Data API credentials are not configured. Add the missing Vercel environment variables before syncing."
      },
      { status: 501 }
    );
  }

  try {
    const report = await fetchGa4Summary();
    const storage = await persistGa4Summary(report);

    return NextResponse.json({
      ok: true,
      source: "GA4",
      status: "synced",
      storage,
      report
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "GA4",
        status: "sync_failed",
        message: error instanceof Error ? error.message : "GA4 sync failed."
      },
      { status: 502 }
    );
  }
}
