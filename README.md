# ZODA Campaign Dashboard

Standalone internal dashboard for ZODA campaign performance across Ads, Social, SEO and Website.

## What This Is

This is a private Next.js dashboard app. It starts with mock data shaped like the future API response, then connects to GA4, Google Search Console, Shopify and ad platforms in phases.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in production values:

```bash
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GA4_PROPERTY_ID=
GSC_SITE_URL=https://zoda.fit/
SHOPIFY_STORE_DOMAIN=zoda-fit.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only in Vercel/local env. The dashboard exposes only safe connection status through `/api/integrations/supabase/health`.

## Routes

- `/login`
- `/dashboard`
- `/dashboard/campaigns`
- `/dashboard/channels`
- `/dashboard/settings`

## API Contracts

- `GET /api/health`
- `GET /api/dashboard/summary?range=30d&campaign=all`
- `GET /api/dashboard/channels?range=30d`
- `GET /api/dashboard/funnel?range=30d`
- `GET /api/integrations/supabase/health`
- `POST /api/sync/ga4`
- `POST /api/sync/gsc`
- `POST /api/sync/shopify`

The sync routes are server-only placeholders right now. They return a safe `not_configured` response when credentials are missing.

## Deployment

1. Create a private GitHub repo named `zoda-campaign-dashboard`.
2. Connect the repo to Vercel.
3. Add the environment variables in Vercel project settings.
4. Deploy preview from pull requests.
5. Promote to production after auth and data sync are confirmed.

The app uses `robots: noindex` metadata because it is internal-only.
