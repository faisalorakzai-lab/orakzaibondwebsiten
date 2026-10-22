-- OKBOND referral backend: verified on-chain qualifying activity only.
-- This migration does not invent commission rates or payout amounts.
begin;
create extension if not exists pgcrypto;

create table if not exists public.referral_profiles (
  wallet_address text primary key check (wallet_address ~ '^0x[0-9a-fA-F]{40}$'),
  referral_code text not null unique check (length(referral_code) between 8 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_qualifying_events (
  id uuid primary key default gen_random_uuid(),
  chain_id integer not null default 137 check (chain_id = 137),
  contract_address text not null check (contract_address ~ '^0x[0-9a-fA-F]{40}$'),
  tx_hash text not null check (tx_hash ~ '^0x[0-9a-fA-F]{64}$'),
  log_index integer not null check (log_index >= 0),
  block_number bigint not null check (block_number >= 0),
  buyer_wallet text not null check (buyer_wallet ~ '^0x[0-9a-fA-F]{40}$'),
  referrer_wallet text not null check (referrer_wallet ~ '^0x[0-9a-fA-F]{40}$'),
  pol_amount numeric(78, 0) not null check (pol_amount >= 0),
  token_amount numeric(78, 0) not null check (token_amount >= 0),
  event_timestamp timestamptz null,
  verification_status text not null default 'verified'
    check (verification_status in ('verified', 'rejected')),
  created_at timestamptz not null default now(),
  unique (chain_id, contract_address, tx_hash, log_index),
  check (lower(buyer_wallet) <> lower(referrer_wallet))
);

create index if not exists referral_events_referrer_idx
  on public.referral_qualifying_events (lower(referrer_wallet), event_timestamp desc);
create index if not exists referral_events_buyer_idx
  on public.referral_qualifying_events (lower(buyer_wallet), event_timestamp desc);

create table if not exists public.referral_commission_snapshots (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null check (wallet_address ~ '^0x[0-9a-fA-F]{40}$'),
  source_contract text not null check (source_contract ~ '^0x[0-9a-fA-F]{40}$'),
  aggregate_earnings numeric(78, 0) not null default 0 check (aggregate_earnings >= 0),
  aggregate_referral_count bigint not null default 0 check (aggregate_referral_count >= 0),
  source_block bigint not null check (source_block >= 0),
  captured_at timestamptz not null default now()
);
create index if not exists referral_snapshots_wallet_idx
  on public.referral_commission_snapshots (lower(wallet_address), captured_at desc);

alter table public.referral_profiles enable row level security;
alter table public.referral_qualifying_events enable row level security;
alter table public.referral_commission_snapshots enable row level security;
revoke all on public.referral_profiles from anon, authenticated, service_role;
revoke all on public.referral_qualifying_events from anon, authenticated, service_role;
revoke all on public.referral_commission_snapshots from anon, authenticated, service_role;
grant select, insert, update on public.referral_profiles to service_role;
grant select, insert on public.referral_qualifying_events to service_role;
grant select, insert on public.referral_commission_snapshots to service_role;
grant usage on schema public to service_role;
commit;
