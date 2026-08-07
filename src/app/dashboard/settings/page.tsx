import { CheckCircle2, CircleAlert, CircleDot } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkSupabaseConnection } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
    keys: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"]
  }
];

export default async function SettingsPage() {
  const supabaseStatus = await checkSupabaseConnection();

  return (
    <AppShell>
      <section className="mb-5">
        <Badge variant="outline" className="border-primary/40 text-primary">Settings</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Data source readiness</h1>
        <p className="mt-2 max-w-[760px] text-sm leading-6 text-muted-foreground">
          Keep secrets in Vercel only. This page documents what the dashboard expects before each sync route is enabled.
        </p>
      </section>

      <section className="mb-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Supabase connection</CardTitle>
                <CardDescription>
                  Server-side service role status for persistence and future sync jobs.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5",
                  supabaseStatus.connected
                    ? "border-primary/40 text-primary"
                    : "border-yellow-300/40 text-yellow-300"
                )}
              >
                {supabaseStatus.connected ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <CircleAlert className="h-3.5 w-3.5" />
                )}
                {supabaseStatus.connected ? "Connected" : "Needs env"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <p className="text-muted-foreground">{supabaseStatus.message}</p>
            {supabaseStatus.projectRef ? (
              <div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                project: {supabaseStatus.projectRef}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {envGroups.map((group) => (
          <Card key={group.title} className="border-border bg-card">
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>Required configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {group.keys.map((key) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                  >
                    <CircleDot className="h-3 w-3 text-muted-foreground" />
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
