import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { getDashboardSummary } from "@/data/mock-dashboard";

export default function CampaignsPage() {
  const data = getDashboardSummary();

  return (
    <AppShell>
      <section className="mb-5">
        <Badge variant="outline" className="border-primary/40 text-primary">Campaigns</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Scale, fix, watch, or pause</h1>
        <p className="mt-2 max-w-[760px] text-sm leading-6 text-muted-foreground">
          A campaign decision table for ads, social, SEO and website actions. Real ad platform rows can replace this mock shape later.
        </p>
      </section>
      <CampaignTable campaigns={data.campaigns} />
    </AppShell>
  );
}
