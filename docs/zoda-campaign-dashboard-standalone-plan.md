# ZODA Standalone Campaign Dashboard Plan

## Summary

Create a private standalone dashboard app for ZODA campaign performance across Ads, Social, SEO and Website. The current Shopify dashboard can remain a visual prototype, but this app should become the real internal data product.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS and custom ZODA dark UI
- Charts: Recharts with ZODA colors
- Backend: Next.js route handlers
- Database/cache: Supabase Postgres
- Auth: NextAuth Google login restricted to `@zoda.sg`
- Hosting: Vercel
- Repository: private GitHub repo named `zoda-campaign-dashboard`

## First Version

The initial version ships with mock/demo data that already matches the API response shape expected from the real integrations.

Pages:

- `/login`
- `/dashboard`
- `/dashboard/campaigns`
- `/dashboard/channels`
- `/dashboard/settings`

API routes:

- `GET /api/health`
- `GET /api/dashboard/summary?range=30d&campaign=all`
- `GET /api/dashboard/channels?range=30d`
- `GET /api/dashboard/funnel?range=30d`
- `POST /api/sync/ga4`
- `POST /api/sync/gsc`
- `POST /api/sync/shopify`

## Data Integration Phases

### Phase 1: Foundation

- Build responsive dashboard UI.
- Use mock JSON data from `src/data/mock-dashboard.ts`.
- Keep all third-party sync routes server-side.
- Add noindex metadata so the dashboard is not indexed.

### Phase 2: Google Data

- Connect GA4 Data API for sessions, events, traffic sources and conversions.
- Connect Google Search Console API for clicks, impressions, CTR, queries and landing pages.
- Store normalized daily metrics in Supabase.

### Phase 3: Shopify Data

- Connect Shopify Admin API for orders, revenue, products and customer/order signals.
- Join Shopify revenue data with GA4 channel/campaign performance.

### Phase 4: Ads and Social

- Start with CSV import if Meta/TikTok API access is delayed.
- Later connect Meta Ads and TikTok Ads APIs for spend, impressions, reach, clicks and creative performance.

## Security Requirements

- No API secrets in browser code.
- Store secrets in Vercel environment variables.
- Restrict login to approved `@zoda.sg` emails.
- Use Supabase service role key only in server routes.
- Keep dashboard pages noindexed.

## Recommended Environment Variables

```bash
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GA4_PROPERTY_ID=
GSC_SITE_URL=https://zoda.fit/
SHOPIFY_STORE_DOMAIN=zoda-fit.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Handoff Notes

- The app is separate from the Shopify theme and should be treated as a normal Next.js/Vercel project.
- The UI is intentionally campaign-general, not only MAB-specific.
- Replace mock data gradually by keeping the same response contracts in the API routes.
- The sync routes currently fail safely when credentials are missing.
