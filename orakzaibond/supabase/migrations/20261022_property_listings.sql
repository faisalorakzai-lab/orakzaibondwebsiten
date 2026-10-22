-- Admin-managed, verified property catalog; this migration creates no demo listings.
-- The public application cannot read or change the table directly.

begin;

create extension if not exists pgcrypto;

create table if not exists public.property_listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) between 3 and 180),
  city text not null check (length(btrim(city)) between 1 and 100),
  location text not null default '' check (length(location) <= 160),
  description text not null default '' check (length(description) <= 2000),
  property_type text not null check (property_type in ('house', 'apartment', 'commercial', 'land')),
  bedrooms smallint null check (bedrooms is null or bedrooms between 1 and 30),
  price_amount numeric(18, 2) null check (price_amount is null or price_amount >= 0),
  price_currency varchar(3) null check (price_currency is null or price_currency ~ '^[A-Z]{3}$'),
  installment_terms text null check (installment_terms is null or length(installment_terms) <= 500),
  image_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(image_urls) = 'array'),
  listing_status text not null default 'draft'
    check (listing_status in ('draft', 'published', 'sold', 'rented', 'withdrawn')),
  verified boolean not null default false,
  created_by uuid null references auth.users(id) on delete set null,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_listings_price_currency_pair
    check (price_amount is null or price_currency is not null),
  constraint property_listings_publish_is_verified
    check (listing_status <> 'published' or (verified and published_at is not null))
);

comment on table public.property_listings is
  'Admin-managed property data. Public API exposes only verified published records.';

create index if not exists property_listings_public_idx
  on public.property_listings (published_at desc)
  where listing_status = 'published' and verified = true;

alter table public.property_listings enable row level security;
revoke all on table public.property_listings from anon, authenticated, service_role;
grant select on table public.property_listings to service_role;
grant usage on schema public to service_role;

commit;
