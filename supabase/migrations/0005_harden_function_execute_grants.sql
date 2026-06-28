-- Tighten the API surface. Trigger functions and the internal secret check
-- must not be REST-callable; everything else is limited to the single anon
-- role the app uses. After this, the only anon-executable SECURITY DEFINER
-- functions are submit_lead (public form, input-validated) and the secret-
-- gated admin_* functions — which is the intended, mitigated surface.

revoke execute on function public.log_lead_created()       from public, anon, authenticated;
revoke execute on function public.log_lead_stage_change()  from public, anon, authenticated;
revoke execute on function public.set_updated_at()         from public, anon, authenticated;
revoke execute on function public._admin_check(text)       from public, anon, authenticated;

revoke execute on function public.admin_list_leads(text)            from public, authenticated;
revoke execute on function public.admin_stats(text)                 from public, authenticated;
revoke execute on function public.admin_get_lead(text, uuid)        from public, authenticated;
revoke execute on function public.admin_set_stage(text, uuid, text) from public, authenticated;
revoke execute on function public.admin_add_note(text, uuid, text, text) from public, authenticated;
revoke execute on function public.submit_lead(text, text, text, int, text, text, text) from public, authenticated;
