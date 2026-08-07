import "server-only";
import { getDashboardSummary as getMockDashboardSummary } from "@/data/mock-dashboard";
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
      channel: "Ads",
      share: 0,
      spend: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      signal: "Ad platform sync is not connected yet.",
      nextMove: "Add paid platform credentials after GA4 and SEO storage are stable."
    },
    {
      channel: "Social",
      share: 0,
      spend: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      signal: "Social sync is not connected yet.",
      nextMove: "Keep social campaign rows planned until Meta/TikTok data is wired."
    },
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

function buildLiveSummary(range: RangeKey, campaign: string, ga4: Awaited<ReturnType<typeof fetchGa4Summary>>, gsc: Awaited<ReturnType<typeof fetchGscSummary>>): DashboardSummary {
  const trend: TrendPoint[] = ga4.rows.map((row) => ({
    date: trendLabel(row.date),
    spend: 0,
    clicks: row.sessions,
    conversions: row.conversions,
    revenue: row.purchaseRevenue
  }));

  return {
    range,
    campaign,
    source: "live",
    statusLabel: "Live GA4 + GSC",
    metrics: [
      { label: "Sessions", value: wholeNumber(ga4.totals.sessions), delta: "Live", note: "From GA4 Data API" },
      { label: "Active users", value: wholeNumber(ga4.totals.activeUsers), delta: "Live", note: "From GA4 Data API" },
      { label: "Events", value: wholeNumber(ga4.totals.eventCount), delta: "Live", note: "Website events in range" },
      { label: "Key events", value: wholeNumber(ga4.totals.conversions), delta: "Live", note: "GA4 conversion events" },
      { label: "Revenue", value: money(ga4.totals.purchaseRevenue), delta: "Live", note: "GA4 purchase revenue" },
      { label: "SEO clicks", value: wholeNumber(gsc.totals.clicks), delta: "Live", note: "From Search Console" },
      { label: "SEO impressions", value: compactNumber(gsc.totals.impressions), delta: percent(gsc.totals.ctr), note: "Search CTR" },
      { label: "Avg position", value: gsc.totals.position.toFixed(1), delta: "Live", note: "Weighted Search Console position" }
    ],
    trend,
    channels: buildChannelMix(ga4.totals.sessions, gsc.totals.clicks, gsc.totals.impressions),
    funnel: buildFunnel(
      gsc.totals.impressions,
      gsc.totals.clicks,
      ga4.totals.sessions,
      ga4.totals.activeUsers,
      ga4.totals.eventCount
    ),
    campaigns: [
      {
        name: "Organic Search Demand",
        channel: "SEO",
        metric: `${wholeNumber(gsc.totals.clicks)} clicks`,
        signal: `${compactNumber(gsc.totals.impressions)} impressions at ${percent(gsc.totals.ctr)} CTR.`,
        nextMove: "Watch",
        status: "watch"
      },
      {
        name: "ZODA Website Engagement",
        channel: "Website",
        metric: `${wholeNumber(ga4.totals.sessions)} sessions`,
        signal: `${wholeNumber(ga4.totals.eventCount)} events from ${wholeNumber(ga4.totals.activeUsers)} active users.`,
        nextMove: "Fix",
        status: "fix"
      },
      {
        name: "Paid Media",
        channel: "Ads",
        metric: "Awaiting sync",
        signal: "Ad platform credentials are not connected yet.",
        nextMove: "Watch",
        status: "watch"
      },
      {
        name: "Social Campaigns",
        channel: "Social",
        metric: "Awaiting sync",
        signal: "Social performance is still planned for a later connector.",
        nextMove: "Watch",
        status: "watch"
      }
    ],
    actions: [
      { status: "scale", title: "Scale", detail: "Use live GA4/GSC signals to identify pages with search demand and website engagement." },
      { status: "fix", title: "Fix", detail: "Improve pages with search impressions but weak CTR or low session engagement." },
      { status: "pause", title: "Pause", detail: "Hold paid-media decisions until ad spend and revenue are connected." },
      { status: "watch", title: "Watch", detail: "Monitor branded search queries and product pages as more traffic accumulates." }
    ]
  };
}

export async function getDashboardSummary(range: RangeKey = "30d", campaign = "all"): Promise<DashboardSummary> {
  const days = rangeDays[range];

  try {
    const [ga4, gsc] = await Promise.all([
      fetchGa4Summary(`${days}daysAgo`, "today"),
      fetchGscSummary(daysAgo(days), daysAgo(1))
    ]);

    return buildLiveSummary(range, campaign, ga4, gsc);
  } catch (error) {
    console.error(
      "Live dashboard summary failed",
      error instanceof Error ? { name: error.name, message: error.message } : { message: String(error) }
    );

    return {
      ...getMockDashboardSummary(range, campaign),
      source: "mock",
      statusLabel: "Mock fallback"
    };
  }
}
