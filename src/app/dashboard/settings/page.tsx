import { CheckCircle2, CircleAlert, CircleDot, Database, KeyRound, Search, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkSupabaseConnection } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ReadinessState = "live" | "ready" | "needs-env" | "pending";

type DataSourceCard = {
  title: string;
  description: string;
  state: ReadinessState;
  status: string;
  icon: typeof KeyRound;
  keys: Array<{
    name: string;
    detail: string;
    configured: boolean;
  }>;
  note: string;
};

function hasEnv(key: string) {
  return Boolean(process.env[key]);
}

function sourceBadgeClass(state: ReadinessState) {
  if (state === "live") return "border-primary/40 bg-primary/10 text-primary";
  if (state === "ready") return "border-sky-300/40 bg-sky-300/10 text-sky-200";
  if (state === "needs-env") return "border-yellow-300/40 bg-yellow-300/10 text-yellow-200";
  return "border-border bg-background text-muted-foreground";
}

export default async function SettingsPage() {
  const supabaseStatus = await checkSupabaseConnection();
  const googleAuthReady = hasEnv("GOOGLE_CLIENT_ID") && hasEnv("GOOGLE_CLIENT_SECRET");
  const googleLiveReady =
    hasEnv("GA4_PROPERTY_ID") &&
    hasEnv("GSC_SITE_URL") &&
    hasEnv("GOOGLE_WORKLOAD_IDENTITY_AUDIENCE") &&
    hasEnv("GOOGLE_IMPERSONATED_SERVICE_ACCOUNT");
  const shopifyReady = hasEnv("SHOPIFY_STORE_DOMAIN") && hasEnv("SHOPIFY_ADMIN_ACCESS_TOKEN");

  const dataSources: DataSourceCard[] = [
    {
      title: "Google",
      description: "OAuth login plus live GA4 and Search Console reporting.",
      state: googleAuthReady && googleLiveReady ? "live" : "needs-env",
      status: googleAuthReady && googleLiveReady ? "Live" : "Needs env",
      icon: Search,
      keys: [
        { name: "GOOGLE_CLIENT_ID", detail: "Sign-in", configured: hasEnv("GOOGLE_CLIENT_ID") },
        { name: "GOOGLE_CLIENT_SECRET", detail: "Sign-in", configured: hasEnv("GOOGLE_CLIENT_SECRET") },
        { name: "GA4_PROPERTY_ID", detail: "Analytics Data API", configured: hasEnv("GA4_PROPERTY_ID") },
        { name: "GSC_SITE_URL", detail: "Search Console property", configured: hasEnv("GSC_SITE_URL") },
        {
          name: "GOOGLE_WORKLOAD_IDENTITY_AUDIENCE",
          detail: "Vercel OIDC to Google WIF",
          configured: hasEnv("GOOGLE_WORKLOAD_IDENTITY_AUDIENCE")
        },
        {
          name: "GOOGLE_IMPERSONATED_SERVICE_ACCOUNT",
          detail: "Google API service account",
          configured: hasEnv("GOOGLE_IMPERSONATED_SERVICE_ACCOUNT")
        }
      ],
      note: "Production uses keyless Vercel OIDC. Do not add long-lived Google private keys."
    },
    {
      title: "Shopify",
      description: "Store and Admin API access for product and order signals.",
      state: shopifyReady ? "ready" : "pending",
      status: shopifyReady ? "Ready" : "Pending",
      icon: ShoppingBag,
      keys: [
        { name: "SHOPIFY_STORE_DOMAIN", detail: "Storefront host", configured: hasEnv("SHOPIFY_STORE_DOMAIN") },
        { name: "SHOPIFY_ADMIN_ACCESS_TOKEN", detail: "Admin API token", configured: hasEnv("SHOPIFY_ADMIN_ACCESS_TOKEN") }
      ],
      note: "Sync route is present, but product/order sync still needs final API scopes and storage."
    },
    {
      title: "Supabase",
      description: "Persistence layer for normalized sync jobs and snapshots.",
      state: supabaseStatus.connected ? "live" : "needs-env",
      status: supabaseStatus.connected ? "Connected" : "Needs env",
      icon: Database,
      keys: [
        { name: "SUPABASE_URL", detail: "Server client", configured: hasEnv("SUPABASE_URL") },
        {
          name: "SUPABASE_SERVICE_ROLE_KEY",
          detail: "Server-only writes",
          configured: hasEnv("SUPABASE_SERVICE_ROLE_KEY")
        },
        {
          name: "NEXT_PUBLIC_SUPABASE_URL",
          detail: "Optional browser URL",
          configured: hasEnv("NEXT_PUBLIC_SUPABASE_URL")
        }
      ],
      note: supabaseStatus.message
    }
  ];

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
          <CardContent className="grid gap-3 text-sm md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-muted-foreground">{supabaseStatus.message}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Google live reporting is already wired through Vercel OIDC. Supabase is the next persistence step.
              </p>
            </div>
            {supabaseStatus.projectRef ? (
              <div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                project: {supabaseStatus.projectRef}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {dataSources.map((source) => {
          const Icon = source.icon;

          return (
            <Card key={source.title} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <CardTitle>{source.title}</CardTitle>
                      <CardDescription>{source.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 gap-1.5", sourceBadgeClass(source.state))}>
                    {source.state === "live" || source.state === "ready" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <CircleAlert className="h-3.5 w-3.5" />
                    )}
                    {source.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <ul className="space-y-2">
                  {source.keys.map((key) => (
                    <li
                      key={key.name}
                      className="grid gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-mono">
                        {key.configured ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        ) : (
                          <CircleDot className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{key.name}</span>
                      </span>
                      <span className="text-muted-foreground">{key.detail}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs leading-5 text-muted-foreground">{source.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </AppShell>
  );
}
