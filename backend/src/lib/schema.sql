-- ============================================
-- AI Lead Intelligence System — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (already enabled on Supabase)
create extension if not exists "pgcrypto";

-- ============================================
-- LEADS TABLE
-- ============================================
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),

  -- Contact info
  name          text,
  email         text,
  phone         text,

  -- Raw message
  message       text not null,
  source        text not null check (source in ('web_form', 'telegram', 'whatsapp', 'email', 'crm', 'manual')),

  -- AI extracted fields
  intent        text check (intent in ('BUY', 'RENT', 'INQUIRE', 'CONSULT', 'OTHER')),
  budget        text,
  location      text,
  timeline      text,

  -- AI scoring
  priority      text not null default 'MEDIUM' check (priority in ('HIGH', 'MEDIUM', 'LOW')),
  confidence    float check (confidence >= 0 and confidence <= 1),
  ai_summary    text,

  -- Pipeline status
  status        text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'lost')),
  assigned_to   text,
  notes         text,

  -- Metadata
  raw_payload   jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================
-- INDEXES for dashboard queries
-- ============================================
create index if not exists leads_priority_idx    on leads (priority);
create index if not exists leads_source_idx      on leads (source);
create index if not exists leads_status_idx      on leads (status);
create index if not exists leads_created_at_idx  on leads (created_at desc);

-- ============================================
-- AUTO-UPDATE updated_at timestamp
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table leads enable row level security;

-- Allow backend service role full access (used by Node.js API)
create policy "Service role full access"
  on leads for all
  using (auth.role() = 'service_role');

-- Allow anon read for dashboard (lock this down in production)
create policy "Anon read access"
  on leads for select
  using (true);

-- ============================================
-- SAMPLE DATA (for testing / demo)
-- ============================================
insert into leads (name, email, message, source, intent, budget, location, timeline, priority, confidence, ai_summary, status)
values
  (
    'Ahmed Al-Rashid',
    'ahmed@example.com',
    'Looking for a 3-bedroom villa in Dubai Marina, budget around $600k, need to move in 2 months',
    'web_form',
    'BUY',
    '$600,000',
    'Dubai Marina',
    '2 months',
    'HIGH',
    0.94,
    'Motivated buyer with clear budget and urgent timeline. Immediate follow-up recommended.',
    'new'
  ),
  (
    'Sara Johnson',
    'sara.j@email.com',
    'Just browsing, maybe interested in renting something in downtown',
    'telegram',
    'RENT',
    null,
    'Downtown',
    null,
    'LOW',
    0.61,
    'Early-stage inquiry with no clear budget or timeline. Add to nurture sequence.',
    'new'
  ),
  (
    'Kwame Mensah',
    'kwame@business.com',
    'We need office space for 20 people, budget is $15k/month, need it within 6 weeks',
    'whatsapp',
    'RENT',
    '$15,000/month',
    'Not specified',
    '6 weeks',
    'HIGH',
    0.91,
    'Commercial client with clear budget and timeline. High-value opportunity — call within the hour.',
    'contacted'
  );
