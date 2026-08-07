create table if not exists public.shopify_orders (
  shop_domain text not null,
  order_id text not null,
  order_name text not null,
  created_at timestamptz not null,
  financial_status text not null default 'UNKNOWN',
  fulfillment_status text not null default 'UNKNOWN',
  total_price numeric(14, 2) not null default 0 check (total_price >= 0),
  subtotal_price numeric(14, 2) not null default 0 check (subtotal_price >= 0),
  total_tax numeric(14, 2) not null default 0 check (total_tax >= 0),
  total_shipping numeric(14, 2) not null default 0 check (total_shipping >= 0),
  currency_code text not null default 'SGD',
  sync_run_id uuid references public.sync_runs(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (shop_domain, order_id)
);

create index if not exists idx_shopify_orders_created_at
  on public.shopify_orders (created_at desc);

alter table public.shopify_orders enable row level security;

revoke all on table public.shopify_orders from anon, authenticated;

grant select, insert, update, delete on table public.shopify_orders to service_role;
