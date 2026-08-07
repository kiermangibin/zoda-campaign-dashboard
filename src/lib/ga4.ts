import "server-only";
import { createSign } from "crypto";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

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
const tokenUrl = "https://oauth2.googleapis.com/token";

function parseServiceAccountJson(value: string): ServiceAccountCredentials {
  const decoded = value.trim().startsWith("{")
    ? value
    : Buffer.from(value, "base64").toString("utf8");
  const parsed = JSON.parse(decoded) as Partial<ServiceAccountCredentials>;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GA4 service account JSON must include client_email and private_key.");
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n")
  };
}

export function getGa4MissingEnv() {
  const missing: string[] = [];

  if (!process.env.GA4_PROPERTY_ID) missing.push("GA4_PROPERTY_ID");

  const hasInlineCredentials =
    Boolean(process.env.GA4_SERVICE_ACCOUNT_JSON) ||
    Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (!hasInlineCredentials && !hasApplicationCredentials) {
    missing.push("GA4_SERVICE_ACCOUNT_JSON");
  }

  return missing;
}

function getServiceAccountCredentials() {
  if (process.env.GA4_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(process.env.GA4_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  }

  throw new Error("GA4 service account credentials are not configured.");
}

type Ga4ApiRow = {
  dimensionValues?: Array<{ value?: string | null }>;
  metricValues?: Array<{ value?: string | null }>;
};

type Ga4RunReportResponse = {
  rows?: Ga4ApiRow[];
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createServiceAccountAssertion(credentials: ServiceAccountCredentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: analyticsScope,
      aud: tokenUrl,
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedToken = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(credentials.private_key);

  return `${unsignedToken}.${base64Url(signature)}`;
}

async function getAccessToken() {
  const assertion = createServiceAccountAssertion(getServiceAccountCredentials());
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const payload = (await response.json()) as { access_token?: string; error_description?: string; error?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Google OAuth token request failed.");
  }

  return payload.access_token;
}

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

  const accessToken = await getAccessToken();
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
