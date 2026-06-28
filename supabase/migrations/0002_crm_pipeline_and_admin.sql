-- Buck Me CRM — pipeline stages, audit trail, notes, activity, and
-- secret-gated admin RPCs. No service-role key required: the public form
-- inserts via submit_lead (migration 0004) and the admin reads/writes via
-- SECURITY DEFINER functions gated by a single shared secret.

-- 1. Pipeline + audit columns
alter table public.leads
  add column if not exists stage      text not null default 'new',
  add column if not exists updated_at timestamptz not null default now();

alter table public.leads drop constraint if exists leads_stage_check;
alter table public.leads add constraint leads_stage_check
  check (stage in ('new','contacted','qualified','approved','funded','lost'));

-- 2. Notes + activity tables
create table if not exists public.lead_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  body       text not null,
  author     text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  type       text not null,           -- 'created' | 'stage_changed' | 'note_added'
  from_stage text,
  to_stage   text,
  detail     text,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx  on public.lead_notes(lead_id);
create index if not exists lead_events_lead_id_idx on public.lead_events(lead_id);
create index if not exists leads_stage_idx         on public.leads(stage);

-- 3. Triggers: keep updated_at fresh + auto-log activity.
-- NB: the logging triggers are SECURITY DEFINER (see migration 0003) so they
-- can write to the RLS-locked lead_events table no matter who edits a lead.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.log_lead_created()
returns trigger language plpgsql set search_path = public as $$
begin
  insert into public.lead_events(lead_id, type, to_stage)
  values (new.id, 'created', new.stage);
  return new;
end; $$;

drop trigger if exists trg_leads_created_log on public.leads;
create trigger trg_leads_created_log after insert on public.leads
for each row execute function public.log_lead_created();

create or replace function public.log_lead_stage_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.stage is distinct from old.stage then
    insert into public.lead_events(lead_id, type, from_stage, to_stage)
    values (new.id, 'stage_changed', old.stage, new.stage);
  end if;
  return new;
end; $$;

drop trigger if exists trg_leads_stage_log on public.leads;
create trigger trg_leads_stage_log after update on public.leads
for each row execute function public.log_lead_stage_change();

-- 4. RLS on the new tables (no public policies; only definer funcs touch them)
alter table public.lead_notes  enable row level security;
alter table public.lead_events enable row level security;

-- 5. Admin secret store. Seed one row out-of-band (not in source control):
--   insert into public.admin_config (secret) values ('<your ADMIN_SECRET>');
create table if not exists public.admin_config (
  id         uuid primary key default gen_random_uuid(),
  secret     text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_config enable row level security;

create or replace function public._admin_check(p_secret text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_secret is null or p_secret = ''
     or p_secret is distinct from (select secret from public.admin_config order by created_at limit 1)
  then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
end; $$;
revoke execute on function public._admin_check(text) from public, anon;

-- 6. Admin RPCs (secret-gated, bypass RLS as definer)
create or replace function public.admin_list_leads(p_secret text)
returns setof public.leads
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_check(p_secret);
  return query select * from public.leads order by created_at desc limit 1000;
end; $$;

create or replace function public.admin_stats(p_secret text)
returns json language plpgsql security definer set search_path = public as $$
declare result json;
begin
  perform public._admin_check(p_secret);
  select coalesce(json_object_agg(stage, payload), '{}'::json) into result
  from (
    select stage, json_build_object('count', count(*), 'amount', coalesce(sum(amount), 0)) as payload
    from public.leads group by stage
  ) s;
  return result;
end; $$;

create or replace function public.admin_get_lead(p_secret text, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare result json;
begin
  perform public._admin_check(p_secret);
  select json_build_object(
    'lead',   (select row_to_json(l) from public.leads l where l.id = p_id),
    'notes',  (select coalesce(json_agg(n order by n.created_at desc), '[]'::json)
                 from public.lead_notes n where n.lead_id = p_id),
    'events', (select coalesce(json_agg(e order by e.created_at desc), '[]'::json)
                 from public.lead_events e where e.lead_id = p_id)
  ) into result;
  return result;
end; $$;

create or replace function public.admin_set_stage(p_secret text, p_id uuid, p_stage text)
returns public.leads language plpgsql security definer set search_path = public as $$
declare r public.leads;
begin
  perform public._admin_check(p_secret);
  if p_stage not in ('new','contacted','qualified','approved','funded','lost') then
    raise exception 'invalid stage: %', p_stage;
  end if;
  update public.leads set stage = p_stage where id = p_id returning * into r;
  if r.id is null then raise exception 'lead not found'; end if;
  return r;
end; $$;

create or replace function public.admin_add_note(p_secret text, p_id uuid, p_body text, p_author text default 'admin')
returns public.lead_notes language plpgsql security definer set search_path = public as $$
declare n public.lead_notes;
begin
  perform public._admin_check(p_secret);
  if coalesce(trim(p_body), '') = '' then raise exception 'empty note'; end if;
  insert into public.lead_notes(lead_id, body, author)
  values (p_id, p_body, coalesce(nullif(trim(p_author), ''), 'admin'))
  returning * into n;
  insert into public.lead_events(lead_id, type, detail)
  values (p_id, 'note_added', left(p_body, 140));
  return n;
end; $$;

grant execute on function public.admin_list_leads(text)            to anon;
grant execute on function public.admin_stats(text)                 to anon;
grant execute on function public.admin_get_lead(text, uuid)        to anon;
grant execute on function public.admin_set_stage(text, uuid, text) to anon;
grant execute on function public.admin_add_note(text, uuid, text, text) to anon;
