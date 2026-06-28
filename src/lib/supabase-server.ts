import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/* ------------------------------------------------------------------ */
/*  Server-side Supabase client. Uses the anon key and only ever calls */
/*  SECURITY DEFINER functions (submit_lead for the public form;       */
/*  admin_* for the CRM, gated by ADMIN_SECRET). The leads table is    */
/*  fully RLS-locked, so no service-role key is required anywhere.     */
/* ------------------------------------------------------------------ */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getRpcClient() {
  if (!URL || !ANON) {
    throw new Error(
      "[supabase] Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example)."
    );
  }
  return createClient<Database>(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
