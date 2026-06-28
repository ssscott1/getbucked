-- The activity-log triggers fire in the context of whoever writes to
-- public.leads (e.g. the anon role via submit_lead's insert). They write to
-- the RLS-locked lead_events table, so they must run as the table owner.
-- Recreate them as SECURITY DEFINER.

create or replace function public.log_lead_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.lead_events(lead_id, type, to_stage)
  values (new.id, 'created', new.stage);
  return new;
end; $$;

create or replace function public.log_lead_stage_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stage is distinct from old.stage then
    insert into public.lead_events(lead_id, type, from_stage, to_stage)
    values (new.id, 'stage_changed', old.stage, new.stage);
  end if;
  return new;
end; $$;
