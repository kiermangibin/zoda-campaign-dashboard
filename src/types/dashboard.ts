export type RangeKey = "7d" | "30d" | "90d";

export type DashboardChannel = "Ads" | "Social" | "SEO" | "Website";

export type ActionStatus = "scale" | "fix" | "pause" | "watch";

export interface MetricCard {
  label: string;
  value: string;
  delta: string;
  note: string;
}

export interface TrendPoint {
  date: string;
  spend: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface ChannelPerformance {
  channel: DashboardChannel;
  share: number;
  spend: number;
  clicks: number;
  conversions: number;
  revenue: number;
  signal: string;
  nextMove: string;
}

export interface FunnelStep {
  label: string;
  value: number;
  rate: number;
}

export interface CampaignRow {
  name: string;
  channel: DashboardChannel;
  metric: string;
  signal: string;
  nextMove: string;
  status: ActionStatus;
}

export interface ActionNote {
  status: ActionStatus;
  title: string;
  detail: string;
}

export interface DashboardSummary {
  range: RangeKey;
  campaign: string;
  source?: "live" | "mock";
  statusLabel?: string;
  metrics: MetricCard[];
  trend: TrendPoint[];
  channels: ChannelPerformance[];
  funnel: FunnelStep[];
  campaigns: CampaignRow[];
  actions: ActionNote[];
}
