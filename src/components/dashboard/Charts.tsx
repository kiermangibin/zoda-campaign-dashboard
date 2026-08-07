"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ChannelPerformance, FunnelStep, TrendPoint } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tooltipStyle = {
  background: "#08110e",
  border: "1px solid rgba(117, 255, 202, 0.18)",
  borderRadius: 8,
  color: "#f5f7f4"
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-0">
        <CardTitle>Daily website activity</CardTitle>
        <p className="text-sm text-muted-foreground">GA4 sessions, key events, and purchase revenue in the selected window.</p>
      </CardHeader>
      <CardContent className="pt-4">
      {data.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-border bg-background px-4 text-center text-sm text-muted-foreground">
          GA4 did not return daily rows for this range.
        </div>
      ) : (
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#55cda1" stopOpacity={0.58} />
                <stop offset="95%" stopColor="#55cda1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(117, 255, 202, 0.08)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#a9b6af", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#a9b6af", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="#55cda1" fill="url(#revenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="conversions" stroke="#f5f7f4" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
      </CardContent>
    </Card>
  );
}

export function ChannelMix({ data }: { data: ChannelPerformance[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-0">
        <CardTitle>Source mix</CardTitle>
        <p className="text-sm text-muted-foreground">Connected source contribution in the selected window.</p>
      </CardHeader>
      <CardContent className="pt-4">
      {data.every((item) => item.share === 0) ? (
        <div className="flex h-[220px] items-center justify-center rounded-md border border-border bg-background px-4 text-center text-sm text-muted-foreground">
          GA4 and Search Console did not return enough demand data for a channel mix.
        </div>
      ) : (
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="share" nameKey="channel" innerRadius={58} outerRadius={96} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.channel}
                  fill={["#55cda1", "#88e9c1", "#d6fff0", "#2f8b6a"][index % 4]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
      <div className="grid gap-2">
        {data.map((item) => (
          <div key={item.channel} className="flex items-center justify-between border-t border-border py-2.5">
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground">{item.channel}</span>
              <p className="truncate text-xs text-muted-foreground">{item.signal}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-primary">{item.share}%</span>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

export function FunnelChart({ data }: { data: FunnelStep[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-0">
        <CardTitle>Acquisition path</CardTitle>
        <p className="text-sm text-muted-foreground">Search visibility through onsite activity and synced orders.</p>
      </CardHeader>
      <CardContent className="pt-4">
      {data.every((item) => item.value === 0) ? (
        <div className="flex h-[250px] items-center justify-center rounded-md border border-border bg-background px-4 text-center text-sm text-muted-foreground">
          No funnel values are available from the connected sources.
        </div>
      ) : (
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 38, right: 12, top: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(117, 255, 202, 0.08)" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="label" type="category" width={110} tick={{ fill: "#a9b6af", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#55cda1" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
      </CardContent>
    </Card>
  );
}
