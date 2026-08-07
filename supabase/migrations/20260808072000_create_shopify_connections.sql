create table if not exists public.shopify_connections (
  shop_domain text primary key,
  access_token text not null,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.shopify_connections enable row level security;

revoke all on table public.shopify_connections from anon, authenticated;

grant select, insert, update, delete on table public.shopify_connections to service_role;
