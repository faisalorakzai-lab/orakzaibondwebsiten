-- OKBOND service inquiries and bill-tracking requests.
-- Apply after 20261022_property_listings.sql and before enabling the Vercel API.
-- No client-facing table policies are created; all customer reads/writes stay in the server API.

begin;

create extension if not exists pgcrypto;

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
