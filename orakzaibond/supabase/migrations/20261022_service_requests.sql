-- OKBOND service inquiries and bill-tracking requests.
-- Apply once to the existing Supabase project before enabling the Vercel API.
-- Property records are managed by an administrator in Supabase, never created as demo data.
-- No client-facing table policies are created; all customer reads/writes stay in the server API.

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
  bedrooms smallint null check (bedrooms is null or bedrooms between 1 and 20),
  price_amount numeric(18, 2) null check (price_amount is null or price_amount >= 0),
  price_currency text null check (price_currency is null or price_currency ~ '^[A-Z]{3}$'),
  installment_terms text null check (installment_terms is null or length(installment_terms) <= 500),
  image_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(image_urls) = 'array'),
  verified boolean not null default false,
  listing_status text not null default 'draft' check (listing_status in ('draft', 'published', 'archived')),
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_listings_publication_requires_verification
    check (listing_status <> 'published' or (verified and published_at is not null)),
  constraint property_listings_price_requires_currency
    check (price_amount is null or price_currency is not null)
);

create index if not exists property_listings_public_catalog_idx
  on public.property_listings (published_at desc)
  where listing_status = 'published' and verified = true;

alter table public.property_listings enable row level security;
revoke all on table public.property_listings from anon, authenticated, service_role;
grant select on table public.property_listings to service_role;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  request_ref text not null unique,
  submission_id uuid not null,
  owner_token_hash text not null check (owner_token_hash ~ '^[a-f0-9]{64}$'),
  service_category text not null check (service_category in ('hotel', 'transport', 'car-rental', 'property', 'utility')),
  request_type text not null check (request_type in ('stay_inquiry', 'transport_inquiry', 'car_rental_inquiry', 'property_inquiry', 'bill_tracking_inquiry')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('draft', 'pending', 'confirmed', 'completed', 'failed', 'cancelled')),
  payment_status text not null default 'not_applicable' check (payment_status in ('not_applicable', 'pending', 'paid', 'failed', 'refunded')),
  amount numeric(18, 2) null check (amount is null or amount >= 0),
  created_at timestamptz not null default now(),
  constraint service_requests_submission_once unique (owner_token_hash, submission_id),
  constraint service_requests_type_matches_category check (
    (service_category = 'hotel' and request_type = 'stay_inquiry') or
    (service_category = 'transport' and request_type = 'transport_inquiry') or
    (service_category = 'car-rental' and request_type = 'car_rental_inquiry') or
    (service_category = 'property' and request_type = 'property_inquiry') or
    (service_category = 'utility' and request_type = 'bill_tracking_inquiry')
  )
);

create index if not exists service_requests_owner_created_idx
  on public.service_requests (owner_token_hash, created_at desc);

alter table public.service_requests enable row level security;

-- No anon/authenticated SELECT, INSERT, UPDATE, or DELETE policy is intentional.
-- The Vercel server API uses its server-only service role and scopes reads by the
-- SHA-256 hash of a random per-browser capability token.
revoke all on table public.service_requests from anon, authenticated, service_role;
grant select, insert on table public.service_requests to service_role;

grant usage on schema public to service_role;

commit;
