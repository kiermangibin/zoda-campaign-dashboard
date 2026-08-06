import { AppShell } from "@/components/layout/AppShell";

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
      <section className="mb-6 py-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-zoda-mint">Settings</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-none">Data source readiness</h1>
        <p className="mt-5 max-w-[760px] text-lg font-semibold leading-relaxed text-zoda-muted">
          Keep secrets in Vercel only. This page documents what the dashboard expects before each sync route is enabled.
        </p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {envGroups.map((group) => (
          <article key={group.title} className="zoda-card p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">{group.title}</p>
            <ul className="mt-5 space-y-3">
              {group.keys.map((key) => (
                <li key={key} className="border-t border-zoda-line pt-3 text-sm font-black uppercase tracking-[0.08em] text-zoda-text">
                  {key}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
