/* ==================================================================== */
/*  CRM SWAP-POINT — the ONLY file that knows where leads are stored.    */
/*                                                                       */
/*  Today: leads are written to Supabase via the `submit_lead` RPC — a   */
/*  SECURITY DEFINER function that validates and inserts server-side, so */
/*  the anon key is enough and the leads table stays fully RLS-locked    */
/*  (no direct insert grant, no service-role key needed). To migrate to  */
/*  HubSpot / Salesforce / a webhook, rewrite the body of `createLead`   */
/*  below and nothing else in the app changes.                           */
/*                                                                       */
/*  Keep the `LeadInput` shape and the `{ ok }` return contract stable.  */
/* ==================================================================== */

import "server-only";
import { getRpcClient } from "./supabase-server";
import type { Frequency, Purpose } from "./loan";

export type LeadInput = {
  firstName: string;
  email: string;
  mobile: string;
  amount: number;
  frequency: Frequency;
  purpose: Purpose;
  termMonths: number; // chosen loan term, in months
  source: string; // which CTA opened the form
};

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Persist a single lead. This is the swap-point: replace the Supabase
 * call below with any CRM/webhook and keep the signature identical.
 */
export async function createLead(input: LeadInput): Promise<CreateLeadResult> {
  try {
    const supabase = getRpcClient();

    const { data, error } = await supabase.rpc("submit_lead", {
      p_first_name: input.firstName,
      p_email: input.email,
      p_mobile: input.mobile,
      p_amount: input.amount,
      p_frequency: input.frequency,
      p_purpose: input.purpose,
      p_source: input.source,
      p_term_months: input.termMonths,
    });

    if (error) {
      console.error("[leads] submit_lead failed:", error.message);
      return { ok: false, error: "store_failed" };
    }

    return { ok: true, id: data as string };
  } catch (err) {
    console.error("[leads] unexpected error:", err);
    return { ok: false, error: "store_failed" };
  }
}
