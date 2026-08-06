"use client";

import { useMemo, useState } from "react";
import { ActionNotes } from "@/components/dashboard/ActionNotes";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { ChannelMix, FunnelChart, TrendChart } from "@/components/dashboard/Charts";
import { Filters } from "@/components/dashboard/Filters";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { getDashboardSummary } from "@/data/mock-dashboard";
import type { RangeKey } from "@/types/dashboard";

export function DashboardClient() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [campaign, setCampaign] = useState("all");
  const data = useMemo(() => getDashboardSummary(range, campaign), [range, campaign]);

  return (
    <div className="space-y-6">
      <section className="grid gap-8 py-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-zoda-mint">Campaign command center</p>
          <h1 className="mt-4 max-w-[880px] font-display text-5xl font-black uppercase leading-[0.9] text-zoda-text md:text-7xl">
            Turn campaign signals into next moves
          </h1>
          <p className="mt-6 max-w-[680px] text-lg font-semibold leading-relaxed text-zoda-muted">
            Track Ads, Social, SEO and Website performance in one private dashboard built for ZODA decision-making.
          </p>
        </div>
        <div className="zoda-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">Current focus</p>
          <h2 className="mt-3 font-display text-3xl font-black uppercase leading-none">Core + MAB intent</h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-zoda-muted">
            Use this mock layer now, then replace each endpoint with GA4, GSC, Shopify and ad data as access is approved.
          </p>
          <div className="mt-5">
            <Filters
              range={range}
              campaign={campaign}
              onRangeChange={setRange}
              onCampaignChange={setCampaign}
            />
          </div>
        </div>
      </section>

      <MetricCards metrics={data.metrics} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <TrendChart data={data.trend} />
        <ChannelMix data={data.channels} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]">
        <FunnelChart data={data.funnel} />
        <CampaignTable campaigns={data.campaigns} />
      </section>

      <ActionNotes actions={data.actions} />
    </div>
  );
}
