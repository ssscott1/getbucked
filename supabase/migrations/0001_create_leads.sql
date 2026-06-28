-- Buck Me — leads table.
-- Applied to the Supabase project on first build. RLS is enabled with no
-- public policies: writes happen server-side via the service-role key
-- (see src/lib/leads.ts).

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  first_name  text,
  email       text,
  mobile      text,
  amount      integer,                 -- requested loan amount (AUD)
  frequency   text,                    -- 'weekly' | 'fortnightly'
  purpose     text,                    -- car | rent | travel | treat | other
  source      text,                    -- which CTA opened the form
  status      text not null default 'new'
);

-- RLS on; no public access. Writes happen server-side with the service role.
alter table public.leads enable row level security;
-- (no anon insert/select policy -- server route uses service role key)
