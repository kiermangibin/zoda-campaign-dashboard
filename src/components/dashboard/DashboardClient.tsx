"use client";

import { useEffect, useState } from "react";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { ChannelMix, FunnelChart, TrendChart } from "@/components/dashboard/Charts";
import { Filters } from "@/components/dashboard/Filters";
import { MetricCards } from "@/components/dashboard/MetricCards";
import type { DashboardSummary, RangeKey } from "@/types/dashboard";
import { AlertCircle, CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardClient() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({ range });
        const response = await fetch(`/api/dashboard/summary?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Dashboard summary request failed.");
        }

        setData((await response.json()) as DashboardSummary);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => controller.abort();
  }, [range]);

  const sourceStyles = {
    live: {
      icon: CheckCircle2,
      className: "border-primary/30 bg-primary/10 text-primary",
      label: "Live"
    },
    not_connected: {
      icon: CircleDashed,
      className: "border-yellow-300/30 bg-yellow-300/10 text-yellow-200",
      label: "Not connected"
    },
    error: {
      icon: AlertCircle,
      className: "border-red-400/30 bg-red-400/10 text-red-200",
      label: "Error"
    }
  } as const;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">Overview</Badge>
            <span className="text-xs text-muted-foreground">
              {isLoading ? "Syncing live data" : data?.statusLabel || "Dashboard data"}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            ZODA performance
          </h1>
          <p className="mt-2 max-w-[720px] text-sm leading-6 text-muted-foreground">
            Connected GA4, Search Console, and Shopify signals for traffic, search demand, and order performance.
          </p>
        </div>
        <Filters
          range={range}
          onRangeChange={setRange}
        />
      </section>

      {!data ? (
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Loading GA4 and Search Console data...
          </CardContent>
        </Card>
      ) : (
        <>
          <MetricCards metrics={data.metrics} />

          {data.dataSources ? (
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Data coverage">
              {data.dataSources.map((source) => {
                const style = sourceStyles[source.status];
                const Icon = style.icon;

                return (
                  <Card key={source.name} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{source.name}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {source.detail}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("shrink-0 gap-1.5", style.className)}>
                          <Icon className="h-3.5 w-3.5" />
                          {style.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <TrendChart data={data.trend} />
            <ChannelMix data={data.channels} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <CampaignTable campaigns={data.campaigns} />
            <FunnelChart data={data.funnel} />
          </section>
        </>
      )}
    </div>
  );
}
