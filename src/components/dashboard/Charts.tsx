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
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 8,
  color: "#f5f7f4"
};

const chartGrid = "rgba(255, 255, 255, 0.07)";
const mutedTick = "#8f9b94";
const sourceColors = ["#55cda1", "#7dd3fc", "#f5d06f", "#c4b5fd"];

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <Card className="border-border bg-card/95">
      <CardHeader className="pb-0">
        <CardTitle>Traffic trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
      {data.length === 0 ? (
        <div className="flex h-[340px] items-center justify-center rounded-md border border-border bg-background px-4 text-center text-sm text-muted-foreground">
          No GA4 trend data for this range.
        </div>
      ) : (
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart accessibilityLayer={false} data={data} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="sessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#55cda1" stopOpacity={0.58} />
                <stop offset="95%" stopColor="#55cda1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartGrid} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: mutedTick, fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: mutedTick, fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area name="Sessions" type="monotone" dataKey="clicks" stroke="#55cda1" fill="url(#sessions)" strokeWidth={2} />
            <Area name="Key events" type="monotone" dataKey="conversions" stroke="#7dd3fc" fill="transparent" strokeWidth={2} />
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
    <Card className="border-border bg-card/95">
      <CardHeader className="pb-0">
        <CardTitle>Source mix</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
      {data.every((item) => item.share === 0) ? (
        <div className="flex h-[220px] items-center justify-center rounded-md border border-border bg-background px-4 text-center text-sm text-muted-foreground">
          No source mix for this range.
        </div>
      ) : (
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Pie data={data} dataKey="share" nameKey="channel" innerRadius={58} outerRadius={96} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.channel}
                  fill={sourceColors[index % sourceColors.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
      <div className="grid gap-2">
        {data.map((item, index) => (
          <div key={item.channel} className="flex items-center justify-between border-t border-border py-2.5">
            <div className="min-w-0">
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: sourceColors[index % sourceColors.length] }}
              />
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
    <Card className="border-border bg-card/95">
      <CardHeader className="pb-0">
        <CardTitle>Acquisition path</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
      {data.every((item) => item.value === 0) ? (
        <div className="flex h-[260px] items-center justify-center rounded-md border border-border bg-background px-4 text-center text-sm text-muted-foreground">
          No funnel data for this range.
        </div>
      ) : (
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer={false} data={data} layout="vertical" margin={{ left: 38, right: 12, top: 0, bottom: 0 }}>
            <CartesianGrid stroke={chartGrid} horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="label" type="category" width={110} tick={{ fill: mutedTick, fontSize: 11 }} />
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
