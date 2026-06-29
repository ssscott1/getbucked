-- Align the product with a Plenti-style personal loan: $5,000–$75,000 over
-- 1–7 years (12–84 months), weekly/fortnightly/monthly repayments. Adds a
-- loan-term column and widens submit_lead's validation; replaces the old
-- 7-arg signature with an 8-arg one that takes the term.

alter table public.leads
  add column if not exists term_months integer;

create or replace function public.submit_lead(
  p_first_name  text,
  p_email       text,
  p_mobile      text,
  p_amount      int,
  p_frequency   text,
  p_purpose     text,
  p_source      text,
  p_term_months int default 60
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
  if p_amount is null or p_amount < 5000 or p_amount > 75000 then
    raise exception 'invalid amount';
  end if;
  if p_frequency not in ('weekly','fortnightly','monthly') then
    raise exception 'invalid frequency';
  end if;
  if p_purpose not in ('car','rent','travel','treat','other') then
    raise exception 'invalid purpose';
  end if;
  if p_term_months is null or p_term_months < 12 or p_term_months > 84 then
    raise exception 'invalid term';
  end if;

  insert into public.leads
    (first_name, email, mobile, amount, frequency, purpose, source, term_months, stage, status)
  values
    (trim(p_first_name), v_email, nullif(trim(p_mobile), ''),
     p_amount, p_frequency, p_purpose,
     coalesce(nullif(trim(p_source), ''), 'unknown'), p_term_months, 'new', 'new')
  returning id into new_id;

  return new_id;
end $$;

revoke execute on function
  public.submit_lead(text, text, text, int, text, text, text, int)
  from public, authenticated;
grant execute on function
  public.submit_lead(text, text, text, int, text, text, text, int) to anon;

drop function if exists public.submit_lead(text, text, text, int, text, text, text);
