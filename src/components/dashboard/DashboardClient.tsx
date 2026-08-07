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

const leakedChartLabels = new Set([
  "Search impressions",
  "SEO clicks",
  "Sessions",
  "Active users",
  "Events",
  "Shopify orders"
]);

function removeLeakedChartLabels() {
  document.body.querySelectorAll(":scope > span").forEach((element) => {
    if (leakedChartLabels.has(element.textContent?.trim() || "")) {
      element.remove();
    }
  });
}

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

  useEffect(() => removeLeakedChartLabels, []);

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
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Performance
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              {isLoading ? "Loading" : data?.statusLabel || "Live data"}
            </Badge>
            {data?.dataSources?.map((source) => {
              const style = sourceStyles[source.status];
              const Icon = style.icon;

              return (
                <Badge
                  key={source.name}
                  variant="outline"
                  className={cn("gap-1.5 border-border bg-card text-muted-foreground", source.status === "live" && "text-primary")}
                  title={source.detail}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {source.name}
                </Badge>
              );
            })}
          </div>
        </div>
        <Filters
          range={range}
          onRangeChange={setRange}
        />
      </section>

      {!data ? (
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Loading dashboard data...
          </CardContent>
        </Card>
      ) : (
        <>
          <MetricCards metrics={data.metrics} />

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)]">
            <TrendChart data={data.trend} />
            <ChannelMix data={data.channels} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)]">
            <CampaignTable campaigns={data.campaigns} />
            <FunnelChart data={data.funnel} />
          </section>
        </>
      )}
    </div>
  );
}
