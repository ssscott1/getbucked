-- Public lead submission via a SECURITY DEFINER RPC. The anon client never
-- touches the leads table directly: no insert grant, no RETURNING-vs-RLS
-- issue, and server-side shape validation as defence in depth. The leads
-- table stays fully RLS-locked.

create or replace function public.submit_lead(
  p_first_name text,
  p_email     text,
  p_mobile    text,
  p_amount    int,
  p_frequency text,
  p_purpose   text,
  p_source    text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid; v_email text;
begin
  v_email := lower(trim(coalesce(p_email, '')));
  if coalesce(trim(p_first_name), '') = '' or char_length(p_first_name) > 80 then
    raise exception 'invalid name';
  end if;
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;
  if p_amount is null or p_amount < 300 or p_amount > 2000 then
    raise exception 'invalid amount';
  end if;
  if p_frequency not in ('weekly','fortnightly') then
    raise exception 'invalid frequency';
  end if;
  if p_purpose not in ('car','rent','travel','treat','other') then
    raise exception 'invalid purpose';
  end if;

  insert into public.leads
    (first_name, email, mobile, amount, frequency, purpose, source, stage, status)
  values
    (trim(p_first_name), v_email, nullif(trim(p_mobile), ''),
     p_amount, p_frequency, p_purpose,
     coalesce(nullif(trim(p_source), ''), 'unknown'), 'new', 'new')
  returning id into new_id;

  return new_id;
end $$;

grant execute on function
  public.submit_lead(text, text, text, int, text, text, text) to anon;

-- Lock direct table writes; all public inserts now go through submit_lead.
drop policy if exists "anon insert leads" on public.leads;
revoke insert on public.leads from anon;
