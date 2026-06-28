/* ==================================================================== */
/*  CRM SWAP-POINT — the ONLY file that knows where leads are stored.    */
/*                                                                       */
/*  Today: leads are written to the Supabase `public.leads` table using  */
/*  the service-role key (server-side only — never imported by client    */
/*  code). To migrate to HubSpot / Salesforce / a webhook, rewrite the   */
/*  body of `createLead` below and nothing else in the app changes.      */
/*                                                                       */
/*  Keep the `LeadInput` shape and the `{ ok }` return contract stable.  */
/* ==================================================================== */

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { Frequency, Purpose } from "./loan";

export type LeadInput = {
  firstName: string;
  email: string;
  mobile: string;
  amount: number;
  frequency: Frequency;
  purpose: Purpose;
  source: string; // which CTA opened the form
};

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Lazily build a Supabase admin client. Throws a clear message if the
 * required server env vars are missing so failures are obvious in logs.
 */
function getAdminClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "[leads] Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example)."
    );
  }

  cachedClient = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

/**
 * Persist a single lead. This is the swap-point: replace the Supabase
 * call below with any CRM/webhook and keep the signature identical.
 */
export async function createLead(input: LeadInput): Promise<CreateLeadResult> {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: input.firstName,
        email: input.email,
        mobile: input.mobile,
        amount: input.amount,
        frequency: input.frequency,
        purpose: input.purpose,
        source: input.source,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[leads] insert failed:", error.message);
      return { ok: false, error: "store_failed" };
    }

    return { ok: true, id: data.id as string };
  } catch (err) {
    console.error("[leads] unexpected error:", err);
    return { ok: false, error: "store_failed" };
  }
}
