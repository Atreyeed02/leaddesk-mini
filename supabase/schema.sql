-- LeadDesk Mini schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  budget_range text not null,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed')),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anyone (including the anonymous public role) can submit the intake form.
create policy "Public can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- Only signed-in admins can read the ledger.
create policy "Authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);

-- Only signed-in admins can update lead status.
create policy "Authenticated can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

-- Create your one admin user under Authentication > Users > Add user
-- (email + password), then use those credentials to sign in at /admin/login.
