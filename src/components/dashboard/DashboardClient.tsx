"use client";

import { useMemo, useState } from "react";
import { ActionNotes } from "@/components/dashboard/ActionNotes";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { ChannelMix, FunnelChart, TrendChart } from "@/components/dashboard/Charts";
import { Filters } from "@/components/dashboard/Filters";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { getDashboardSummary } from "@/data/mock-dashboard";
import type { RangeKey } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardClient() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [campaign, setCampaign] = useState("all");
  const data = useMemo(() => getDashboardSummary(range, campaign), [range, campaign]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">Overview</Badge>
            <span className="text-xs text-muted-foreground">Last synced mock data</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Campaign performance
          </h1>
          <p className="mt-2 max-w-[720px] text-sm leading-6 text-muted-foreground">
            Track demand, spend efficiency, and next actions across Ads, Social, SEO, and Website.
          </p>
        </div>
        <Filters
          range={range}
          campaign={campaign}
          onRangeChange={setRange}
          onCampaignChange={setCampaign}
        />
      </section>

      <MetricCards metrics={data.metrics} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <TrendChart data={data.trend} />
        <ChannelMix data={data.channels} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <CampaignTable campaigns={data.campaigns} />
        <div className="grid gap-4">
          <FunnelChart data={data.funnel} />
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">Current focus</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Core products and Mission Athlete Bag intent are the priority while live GA4, GSC, Shopify, and ad data come online.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <ActionNotes actions={data.actions} />
    </div>
  );
}
