import "server-only";
import { fetchGa4Summary } from "@/lib/ga4";
import { fetchGscSummary } from "@/lib/gsc";
import type { ChannelPerformance, DashboardSummary, FunnelStep, RangeKey, TrendPoint } from "@/types/dashboard";

const rangeDays: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90
};

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function wholeNumber(value: number) {
  return new Intl.NumberFormat("en").format(Math.round(value));
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function money(value: number) {
  return value > 0 ? `SGD ${compactNumber(value)}` : "SGD 0";
}

function trendLabel(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(`${date}T00:00:00Z`));
}

function rate(value: number, base: number) {
  return base > 0 ? Number(((value / base) * 100).toFixed(1)) : 0;
}

function share(value: number, base: number) {
  return base > 0 ? Math.round((value / base) * 100) : 0;
}

function buildChannelMix(ga4Sessions: number, gscClicks: number, gscImpressions: number): ChannelPerformance[] {
  const demand = ga4Sessions + gscClicks;

  return [
    {
      channel: "SEO",
      share: share(gscClicks, demand),
      spend: 0,
      clicks: gscClicks,
      conversions: 0,
      revenue: 0,
      signal: `${wholeNumber(gscClicks)} organic clicks from ${compactNumber(gscImpressions)} search impressions.`,
      nextMove: "Expand pages and queries with impressions but low CTR."
    },
    {
      channel: "Website",
      share: share(ga4Sessions, demand),
      spend: 0,
      clicks: ga4Sessions,
      conversions: 0,
      revenue: 0,
      signal: `${wholeNumber(ga4Sessions)} sessions recorded in GA4.`,
      nextMove: "Use GA4 events to identify product and checkout drop-offs."
    }
  ];
}

function buildFunnel(impressions: number, clicks: number, sessions: number, activeUsers: number, events: number): FunnelStep[] {
  return [
    { label: "Search impressions", value: impressions, rate: 100 },
    { label: "SEO clicks", value: clicks, rate: rate(clicks, impressions) },
    { label: "Sessions", value: sessions, rate: rate(sessions, Math.max(clicks, 1)) },
    { label: "Active users", value: activeUsers, rate: rate(activeUsers, Math.max(sessions, 1)) },
    { label: "Events", value: events, rate: rate(events, Math.max(activeUsers, 1)) }
  ];
}

type Ga4Result = Awaited<ReturnType<typeof fetchGa4Summary>>;
type GscResult = Awaited<ReturnType<typeof fetchGscSummary>>;

function sourceError(result: PromiseSettledResult<unknown>) {
  if (result.status === "fulfilled") return "";
  return result.reason instanceof Error ? result.reason.message : String(result.reason);
}

function buildSummaryFromSources(
  range: RangeKey,
  campaign: string,
  ga4: Ga4Result | null,
  gsc: GscResult | null,
  errors: { ga4?: string; gsc?: string }
): DashboardSummary {
  const trend: TrendPoint[] = (ga4?.rows || []).map((row) => ({
    date: trendLabel(row.date),
    spend: 0,
    clicks: row.sessions,
    conversions: row.conversions,
    revenue: row.purchaseRevenue
  }));

  const ga4Totals = ga4?.totals || {
    activeUsers: 0,
    sessions: 0,
    eventCount: 0,
    conversions: 0,
    purchaseRevenue: 0
  };
  const gscTotals = gsc?.totals || {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0
  };
  const hasAnyLiveSource = Boolean(ga4 || gsc);
  const hasAllLiveSources = Boolean(ga4 && gsc);

  return {
    range,
    campaign,
    source: hasAllLiveSources ? "live" : hasAnyLiveSource ? "partial" : "unavailable",
    statusLabel: hasAllLiveSources ? "Live GA4 + GSC" : hasAnyLiveSource ? "Partial live data" : "No live data available",
    dateRange: {
      startDate: ga4?.dateRange.startDate || gsc?.dateRange.startDate || "",
      endDate: ga4?.dateRange.endDate || gsc?.dateRange.endDate || ""
    },
    dataSources: [
      {
        name: "Google Analytics",
        status: ga4 ? "live" : "error",
        detail: ga4 ? `Property ${ga4.propertyId}` : errors.ga4 || "GA4 request failed."
      },
      {
        name: "Search Console",
        status: gsc ? "live" : "error",
        detail: gsc ? gsc.siteUrl : errors.gsc || "Search Console request failed."
      },
      {
        name: "Shopify",
        status: "not_connected",
        detail: "Admin token is not connected yet."
      },
      {
        name: "Paid and social",
        status: "not_connected",
        detail: "Ad platform connectors are not connected yet."
      }
    ],
    metrics: [
      { label: "Sessions", value: wholeNumber(ga4Totals.sessions), delta: ga4 ? "GA4" : "Missing", note: ga4 ? "From GA4 Data API" : "Google Analytics did not return data" },
      { label: "Active users", value: wholeNumber(ga4Totals.activeUsers), delta: ga4 ? "GA4" : "Missing", note: ga4 ? "From GA4 Data API" : "Google Analytics did not return data" },
      { label: "Events", value: wholeNumber(ga4Totals.eventCount), delta: ga4 ? "GA4" : "Missing", note: ga4 ? "Website events in range" : "Google Analytics did not return data" },
      { label: "Key events", value: wholeNumber(ga4Totals.conversions), delta: ga4 ? "GA4" : "Missing", note: ga4 ? "GA4 conversion events" : "Google Analytics did not return data" },
      { label: "Revenue", value: money(ga4Totals.purchaseRevenue), delta: ga4 ? "GA4" : "Missing", note: ga4 ? "GA4 purchase revenue" : "Shopify/order revenue is not connected" },
      { label: "SEO clicks", value: wholeNumber(gscTotals.clicks), delta: gsc ? "GSC" : "Missing", note: gsc ? "From Search Console" : "Search Console did not return data" },
      { label: "SEO impressions", value: compactNumber(gscTotals.impressions), delta: gsc ? percent(gscTotals.ctr) : "Missing", note: gsc ? "Search CTR" : "Search Console did not return data" },
      { label: "Avg position", value: gscTotals.position ? gscTotals.position.toFixed(1) : "0.0", delta: gsc ? "GSC" : "Missing", note: gsc ? "Weighted Search Console position" : "Search Console did not return data" }
    ],
    trend,
    channels: buildChannelMix(ga4Totals.sessions, gscTotals.clicks, gscTotals.impressions),
    funnel: buildFunnel(
      gscTotals.impressions,
      gscTotals.clicks,
      ga4Totals.sessions,
      ga4Totals.activeUsers,
      ga4Totals.eventCount
    ),
    campaigns: (gsc?.rows || []).slice(0, 8).map((row) => ({
      name: row.query || "Unknown search query",
      channel: "SEO",
      metric: `${wholeNumber(row.clicks)} clicks`,
      signal: `${compactNumber(row.impressions)} impressions, ${percent(row.ctr)} CTR, avg position ${row.position.toFixed(1)}. ${row.page}`,
      nextMove: row.impressions > 0 && row.ctr < 0.03 ? "Fix" : "Watch",
      status: row.impressions > 0 && row.ctr < 0.03 ? "fix" : "watch"
    })),
    actions: [
      { status: "scale", title: "Scale", detail: "Use live search demand and GA4 engagement to decide which pages deserve more content or campaigns." },
      { status: "fix", title: "Fix", detail: "Improve Search Console rows with impressions but weak CTR before spending against them." },
      { status: "pause", title: "Hold", detail: "Do not show ROAS, CPA, ad spend, or order decisions until Shopify and paid media connectors are live." },
      { status: "watch", title: "Watch", detail: "Monitor branded search and page engagement while traffic volume is still building." }
    ]
  };
}

export async function getDashboardSummary(range: RangeKey = "30d", campaign = "all"): Promise<DashboardSummary> {
  const days = rangeDays[range];

  const [ga4Result, gscResult] = await Promise.allSettled([
    fetchGa4Summary(`${days}daysAgo`, "today"),
    fetchGscSummary(daysAgo(days), daysAgo(1))
  ]);

  if (ga4Result.status === "rejected" || gscResult.status === "rejected") {
    console.error("Dashboard source failure", {
      ga4: sourceError(ga4Result),
      gsc: sourceError(gscResult)
    });
  }

  return buildSummaryFromSources(
    range,
    campaign,
    ga4Result.status === "fulfilled" ? ga4Result.value : null,
    gscResult.status === "fulfilled" ? gscResult.value : null,
    {
      ga4: sourceError(ga4Result),
      gsc: sourceError(gscResult)
    }
  );
}
