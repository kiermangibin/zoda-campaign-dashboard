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

const tooltipStyle = {
  background: "#07100d",
  border: "1px solid rgba(117, 255, 202, 0.32)",
  borderRadius: 0,
  color: "#f5f7f4"
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <section className="zoda-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">Trend</p>
          <h2 className="mt-2 font-display text-2xl font-black uppercase leading-none">Daily performance</h2>
        </div>
      </div>
      <div className="h-[320px]">
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
    </section>
  );
}

export function ChannelMix({ data }: { data: ChannelPerformance[] }) {
  return (
    <section className="zoda-card p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">Channel mix</p>
      <h2 className="mt-2 font-display text-2xl font-black uppercase leading-none">Where demand starts</h2>
      <div className="mt-5 h-[260px]">
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
      <div className="grid gap-2">
        {data.map((item) => (
          <div key={item.channel} className="flex items-center justify-between border-t border-zoda-line py-3">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-zoda-text">{item.channel}</span>
            <span className="text-sm font-black text-zoda-mint">{item.share}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FunnelChart({ data }: { data: FunnelStep[] }) {
  return (
    <section className="zoda-card p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">Funnel</p>
      <h2 className="mt-2 font-display text-2xl font-black uppercase leading-none">Impression to order</h2>
      <div className="mt-5 h-[300px]">
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
    </section>
  );
}
