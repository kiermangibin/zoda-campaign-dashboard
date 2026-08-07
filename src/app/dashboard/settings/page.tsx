import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const envGroups = [
  {
    title: "Google",
    keys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GA4_PROPERTY_ID", "GSC_SITE_URL"]
  },
  {
    title: "Shopify",
    keys: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN"]
  },
  {
    title: "Supabase",
    keys: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  }
];

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="mb-5">
        <Badge variant="outline" className="border-primary/40 text-primary">Settings</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Data source readiness</h1>
        <p className="mt-2 max-w-[760px] text-sm leading-6 text-muted-foreground">
          Keep secrets in Vercel only. This page documents what the dashboard expects before each sync route is enabled.
        </p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {envGroups.map((group) => (
          <Card key={group.title} className="border-border bg-card">
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {group.keys.map((key) => (
                  <li
                    key={key}
                    className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                  >
                    {key}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
