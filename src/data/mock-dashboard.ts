import type { DashboardSummary, RangeKey } from "@/types/dashboard";

const trend = [
  { date: "Aug 01", spend: 420, clicks: 910, conversions: 28, revenue: 4200 },
  { date: "Aug 02", spend: 460, clicks: 980, conversions: 32, revenue: 4880 },
  { date: "Aug 03", spend: 510, clicks: 1060, conversions: 31, revenue: 4620 },
  { date: "Aug 04", spend: 530, clicks: 1160, conversions: 39, revenue: 5940 },
  { date: "Aug 05", spend: 570, clicks: 1220, conversions: 44, revenue: 6710 },
  { date: "Aug 06", spend: 610, clicks: 1310, conversions: 48, revenue: 7240 },
  { date: "Aug 07", spend: 640, clicks: 1380, conversions: 51, revenue: 7820 }
];

export function getDashboardSummary(range: RangeKey = "30d", campaign = "all"): DashboardSummary {
  return {
    range,
    campaign,
    metrics: [
      { label: "Spend", value: "SGD 12.8K", delta: "+9.4%", note: "Scaled week over week" },
      { label: "Reach", value: "286K", delta: "+18%", note: "Social plus paid lift" },
      { label: "Clicks", value: "21.4K", delta: "+12.2%", note: "CTR holding steady" },
      { label: "CTR", value: "3.8%", delta: "+0.4pt", note: "Creative tests improving" },
      { label: "Conversions", value: "846", delta: "+15.1%", note: "Checkout intent rising" },
      { label: "Revenue", value: "SGD 92K", delta: "+21%", note: "Core products leading" },
      { label: "ROAS", value: "7.2x", delta: "+0.8x", note: "Above target" },
      { label: "SEO Clicks", value: "6.9K", delta: "+7.7%", note: "Non-brand queries growing" }
    ],
    trend,
    channels: [
      {
        channel: "Ads",
        share: 42,
        spend: 9200,
        clicks: 12400,
        conversions: 420,
        revenue: 47000,
        signal: "High intent on core-performance ads",
        nextMove: "Scale winning creative and isolate weak audiences"
      },
      {
        channel: "Social",
        share: 24,
        spend: 1800,
        clicks: 5200,
        conversions: 136,
        revenue: 14800,
        signal: "Community content is driving assisted visits",
        nextMove: "Turn ambassador stories into paid tests"
      },
      {
        channel: "SEO",
        share: 19,
        spend: 0,
        clicks: 6900,
        conversions: 168,
        revenue: 18100,
        signal: "Fabric and product-fit pages are gaining clicks",
        nextMove: "Publish comparison pages and improve internal links"
      },
      {
        channel: "Website",
        share: 15,
        spend: 0,
        clicks: 3100,
        conversions: 122,
        revenue: 12100,
        signal: "Homepage product actions improved after layout fixes",
        nextMove: "Keep monitoring mobile add-to-cart and reviews"
      }
    ],
    funnel: [
      { label: "Impressions", value: 748000, rate: 100 },
      { label: "Clicks", value: 21400, rate: 2.9 },
      { label: "Sessions", value: 18200, rate: 85 },
      { label: "Product Views", value: 9600, rate: 53 },
      { label: "Add To Cart", value: 2300, rate: 24 },
      { label: "Checkout", value: 1180, rate: 51 },
      { label: "Orders", value: 846, rate: 72 }
    ],
    campaigns: [
      {
        name: "Core Performance Launch",
        channel: "Ads",
        metric: "ROAS 8.1x",
        signal: "Strong purchase intent from shorts and bra creatives",
        nextMove: "Scale",
        status: "scale"
      },
      {
        name: "Mission Athlete Bag Waitlist",
        channel: "Social",
        metric: "CTR 4.6%",
        signal: "High curiosity but conversion drop after landing",
        nextMove: "Fix landing story and shorten form",
        status: "fix"
      },
      {
        name: "Fabric System SEO",
        channel: "SEO",
        metric: "Clicks +22%",
        signal: "Fabric terms gaining impressions",
        nextMove: "Watch and expand internal links",
        status: "watch"
      },
      {
        name: "Generic Sale Creative",
        channel: "Ads",
        metric: "CPA +34%",
        signal: "Spend rising without revenue lift",
        nextMove: "Pause",
        status: "pause"
      }
    ],
    actions: [
      { status: "scale", title: "Scale", detail: "Increase budget on core-performance campaigns with stable ROAS." },
      { status: "fix", title: "Fix", detail: "Prioritize landing pages with traffic but weak add-to-cart rate." },
      { status: "pause", title: "Pause", detail: "Stop campaigns where CPA rose for three straight days." },
      { status: "watch", title: "Watch", detail: "Monitor SEO pages gaining impressions before creating new content." }
    ]
  };
}

export const supportedRanges: RangeKey[] = ["7d", "30d", "90d"];
