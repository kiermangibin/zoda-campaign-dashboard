import "server-only";
import { getGoogleAccessToken, getGoogleServiceAccountMissingEnv } from "@/lib/google-service-account";

const webmastersScope = "https://www.googleapis.com/auth/webmasters.readonly";

type GscApiRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type GscSearchAnalyticsResponse = {
  rows?: GscApiRow[];
  error?: {
    message?: string;
    status?: string;
  };
};

export type GscSummary = {
  siteUrl: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  rows: Array<{
    query: string;
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
};

export function getGscMissingEnv() {
  const missing: string[] = [];

  if (!process.env.GSC_SITE_URL) missing.push("GSC_SITE_URL");
  missing.push(...getGoogleServiceAccountMissingEnv());

  return missing;
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function fetchGscSummary(startDate = dateDaysAgo(30), endDate = dateDaysAgo(1)): Promise<GscSummary> {
  const siteUrl = process.env.GSC_SITE_URL;

  if (!siteUrl) {
    throw new Error("GSC_SITE_URL is not configured.");
  }

  const accessToken = await getGoogleAccessToken(webmastersScope);
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query", "page"],
        rowLimit: 25,
        startRow: 0
      })
    }
  );

  const payload = (await response.json()) as GscSearchAnalyticsResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || payload.error?.status || "Search Console query failed.");
  }

  const rows = (payload.rows || []).map((row) => ({
    query: row.keys?.[0] || "",
    page: row.keys?.[1] || "",
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0)
  }));

  const baseTotals = rows.reduce(
    (sum, row) => ({
      clicks: sum.clicks + row.clicks,
      impressions: sum.impressions + row.impressions,
      positionWeighted: sum.positionWeighted + row.position * row.impressions
    }),
    { clicks: 0, impressions: 0, positionWeighted: 0 }
  );

  return {
    siteUrl,
    dateRange: { startDate, endDate },
    totals: {
      clicks: baseTotals.clicks,
      impressions: baseTotals.impressions,
      ctr: baseTotals.impressions > 0 ? baseTotals.clicks / baseTotals.impressions : 0,
      position: baseTotals.impressions > 0 ? baseTotals.positionWeighted / baseTotals.impressions : 0
    },
    rows
  };
}
