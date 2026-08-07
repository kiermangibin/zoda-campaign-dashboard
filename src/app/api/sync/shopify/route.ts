import { NextResponse } from "next/server";
import { fetchShopifySummary, getShopifyMissingEnv } from "@/lib/shopify";
import { persistShopifySummary } from "@/lib/sync-storage";

export async function POST() {
  const missing = getShopifyMissingEnv();

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        source: "Shopify",
        status: "not_configured",
        missing,
        message:
          "Shopify Admin API credentials are not configured. Add the missing Vercel environment variables before syncing."
      },
      { status: 501 }
    );
  }

  try {
    const report = await fetchShopifySummary();
    const storage = await persistShopifySummary(report);

    return NextResponse.json({
      ok: true,
      source: "Shopify",
      status: "synced",
      storage,
      report
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "Shopify",
        status: "sync_failed",
        message: error instanceof Error ? error.message : "Shopify sync failed."
      },
      { status: 502 }
    );
  }
}
