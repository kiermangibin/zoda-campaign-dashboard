import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { getDashboardSummary } from "@/lib/dashboard-summary";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const data = await getDashboardSummary();

  return (
    <AppShell>
      <section className="mb-5">
        <Badge variant="outline" className="border-primary/40 text-primary">Campaigns</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Search opportunities</h1>
        <p className="mt-2 max-w-[760px] text-sm leading-6 text-muted-foreground">
          Live Search Console queries and pages. Paid, social, and Shopify decisions stay hidden until those connectors are live.
        </p>
      </section>
      <CampaignTable campaigns={data.campaigns} />
    </AppShell>
  );
}
