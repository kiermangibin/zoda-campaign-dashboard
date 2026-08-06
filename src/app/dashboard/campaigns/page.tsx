import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { AppShell } from "@/components/layout/AppShell";
import { getDashboardSummary } from "@/data/mock-dashboard";

export default function CampaignsPage() {
  const data = getDashboardSummary();

  return (
    <AppShell>
      <section className="mb-6 py-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-zoda-mint">Campaigns</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-none">What to scale, fix or pause</h1>
        <p className="mt-5 max-w-[760px] text-lg font-semibold leading-relaxed text-zoda-muted">
          A campaign decision table for ads, social, SEO and website actions. Real ad platform rows can replace this mock shape later.
        </p>
      </section>
      <CampaignTable campaigns={data.campaigns} />
    </AppShell>
  );
}
