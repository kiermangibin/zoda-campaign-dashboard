import { ChannelMix, FunnelChart, TrendChart } from "@/components/dashboard/Charts";
import { AppShell } from "@/components/layout/AppShell";
import { getDashboardSummary } from "@/data/mock-dashboard";

export default function ChannelsPage() {
  const data = getDashboardSummary();

  return (
    <AppShell>
      <section className="mb-6 py-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-zoda-mint">Channels</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-none">Ads, Social, SEO and Website</h1>
        <p className="mt-5 max-w-[760px] text-lg font-semibold leading-relaxed text-zoda-muted">
          Compare channel contribution and watch the conversion path from first impression to order.
        </p>
      </section>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <TrendChart data={data.trend} />
        <ChannelMix data={data.channels} />
      </section>
      <div className="mt-6">
        <FunnelChart data={data.funnel} />
      </div>
    </AppShell>
  );
}
