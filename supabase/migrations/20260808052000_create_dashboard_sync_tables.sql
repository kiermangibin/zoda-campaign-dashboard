create extension if not exists pgcrypto;

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('ga4', 'gsc', 'shopify')),
  status text not null check (status in ('synced', 'failed')),
  range_start date,
  range_end date,
  row_count integer not null default 0 check (row_count >= 0),
  totals jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz not null default now()
);

create table if not exists public.ga4_daily_metrics (
  property_id text not null,
  metric_date date not null,
  active_users integer not null default 0 check (active_users >= 0),
  sessions integer not null default 0 check (sessions >= 0),
  event_count integer not null default 0 check (event_count >= 0),
  conversions numeric not null default 0 check (conversions >= 0),
  purchase_revenue numeric(14, 2) not null default 0 check (purchase_revenue >= 0),
  sync_run_id uuid references public.sync_runs(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (property_id, metric_date)
);

create table if not exists public.gsc_query_page_metrics (
  site_url text not null,
  range_start date not null,
  range_end date not null,
  query text not null,
  page text not null,
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  ctr numeric not null default 0 check (ctr >= 0),
  position numeric not null default 0 check (position >= 0),
  sync_run_id uuid references public.sync_runs(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (site_url, range_start, range_end, query, page)
);

create index if not exists idx_sync_runs_source_finished_at
  on public.sync_runs (source, finished_at desc);

create index if not exists idx_ga4_daily_metrics_metric_date
  on public.ga4_daily_metrics (metric_date desc);

create index if not exists idx_gsc_query_page_metrics_range
  on public.gsc_query_page_metrics (range_end desc, clicks desc);

alter table public.sync_runs enable row level security;
alter table public.ga4_daily_metrics enable row level security;
alter table public.gsc_query_page_metrics enable row level security;

revoke all on table public.sync_runs from anon, authenticated;
revoke all on table public.ga4_daily_metrics from anon, authenticated;
revoke all on table public.gsc_query_page_metrics from anon, authenticated;

grant select, insert, update, delete on table public.sync_runs to service_role;
grant select, insert, update, delete on table public.ga4_daily_metrics to service_role;
grant select, insert, update, delete on table public.gsc_query_page_metrics to service_role;
