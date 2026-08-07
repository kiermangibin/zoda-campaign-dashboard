import "server-only";
import { getGoogleAccessToken, getGoogleServiceAccountMissingEnv } from "@/lib/google-service-account";

export type Ga4Summary = {
  propertyId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totals: {
    activeUsers: number;
    sessions: number;
    eventCount: number;
    conversions: number;
    purchaseRevenue: number;
  };
  rows: Array<{
    date: string;
    activeUsers: number;
    sessions: number;
    eventCount: number;
    conversions: number;
    purchaseRevenue: number;
  }>;
};

const metricNames = ["activeUsers", "sessions", "eventCount", "conversions", "purchaseRevenue"] as const;
const analyticsScope = "https://www.googleapis.com/auth/analytics.readonly";

export function getGa4MissingEnv() {
  const missing: string[] = [];

  if (!process.env.GA4_PROPERTY_ID) missing.push("GA4_PROPERTY_ID");
  missing.push(...getGoogleServiceAccountMissingEnv());

  return missing;
}

type Ga4ApiRow = {
  dimensionValues?: Array<{ value?: string | null }>;
  metricValues?: Array<{ value?: string | null }>;
};

type Ga4RunReportResponse = {
  rows?: Ga4ApiRow[];
};

function metricValue(row: Ga4ApiRow, index: number) {
  return Number(row.metricValues?.[index]?.value || 0);
}

function compactDate(value: string) {
  if (value.length !== 8) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

export async function fetchGa4Summary(startDate = "30daysAgo", endDate = "today"): Promise<Ga4Summary> {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured.");
  }

  const accessToken = await getGoogleAccessToken(analyticsScope);
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: metricNames.map((name) => ({ name })),
        orderBys: [{ dimension: { dimensionName: "date" } }]
      })
    }
  );

  const payload = (await response.json()) as Ga4RunReportResponse & {
    error?: { message?: string; status?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || payload.error?.status || "GA4 Data API runReport failed.");
  }

  const rows = (payload.rows || []).map((row) => ({
    date: compactDate(row.dimensionValues?.[0]?.value || ""),
    activeUsers: metricValue(row, 0),
    sessions: metricValue(row, 1),
    eventCount: metricValue(row, 2),
    conversions: metricValue(row, 3),
    purchaseRevenue: metricValue(row, 4)
  }));

  const totals = rows.reduce(
    (sum, row) => ({
      activeUsers: sum.activeUsers + row.activeUsers,
      sessions: sum.sessions + row.sessions,
      eventCount: sum.eventCount + row.eventCount,
      conversions: sum.conversions + row.conversions,
      purchaseRevenue: sum.purchaseRevenue + row.purchaseRevenue
    }),
    {
      activeUsers: 0,
      sessions: 0,
      eventCount: 0,
      conversions: 0,
      purchaseRevenue: 0
    }
  );

  return {
    propertyId,
    dateRange: { startDate, endDate },
    totals,
    rows
  };
}
