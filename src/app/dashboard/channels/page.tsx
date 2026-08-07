import { ChannelMix, FunnelChart, TrendChart } from "@/components/dashboard/Charts";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { getDashboardSummary } from "@/lib/dashboard-summary";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const data = await getDashboardSummary();

  return (
    <AppShell>
      <section className="mb-5">
        <Badge variant="outline" className="border-primary/40 text-primary">Channels</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Source performance</h1>
        <p className="mt-2 max-w-[760px] text-sm leading-6 text-muted-foreground">
          Compare connected GA4, Search Console, and Shopify signals. Sources only appear when the dashboard has real data for them.
        </p>
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <TrendChart data={data.trend} />
        <ChannelMix data={data.channels} />
      </section>
      <div className="mt-4">
        <FunnelChart data={data.funnel} />
      </div>
    </AppShell>
  );
}
