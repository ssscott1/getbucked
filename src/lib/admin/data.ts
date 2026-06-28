import "server-only";
import { getRpcClient } from "@/lib/supabase-server";
import { getAdminSecret } from "./auth";
import type { Database } from "@/lib/database.types";

/* ------------------------------------------------------------------ */
/*  Admin data layer — the ONLY place the CRM reads/writes leads.      */
/*  Everything goes through secret-gated SECURITY DEFINER functions    */
/*  (admin_*) so no service-role key is needed. To move the CRM to a   */
/*  different backend, reimplement these functions and nothing in the  */
/*  admin UI changes.                                                  */
/* ------------------------------------------------------------------ */

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadNote = Database["public"]["Tables"]["lead_notes"]["Row"];
export type LeadEvent = Database["public"]["Tables"]["lead_events"]["Row"];

export type StageStats = Record<string, { count: number; amount: number }>;

export type LeadDetail = {
  lead: Lead;
  notes: LeadNote[];
  events: LeadEvent[];
};

function secretOrThrow(): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error(
      "[admin] ADMIN_SECRET is not set. Add it to .env.local (and your host) " +
        "to enable the CRM — see .env.example."
    );
  }
  return secret;
}

export async function listLeads(): Promise<Lead[]> {
  const secret = secretOrThrow();
  const { data, error } = await getRpcClient().rpc("admin_list_leads", {
    p_secret: secret,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function getStats(): Promise<StageStats> {
  const secret = secretOrThrow();
  const { data, error } = await getRpcClient().rpc("admin_stats", {
    p_secret: secret,
  });
  if (error) throw new Error(error.message);
  return (data ?? {}) as StageStats;
}

export async function getLead(id: string): Promise<LeadDetail> {
  const secret = secretOrThrow();
  const { data, error } = await getRpcClient().rpc("admin_get_lead", {
    p_secret: secret,
    p_id: id,
  });
  if (error) throw new Error(error.message);
  return data as unknown as LeadDetail;
}

export async function setStage(id: string, stage: string): Promise<Lead> {
  const secret = secretOrThrow();
  const { data, error } = await getRpcClient().rpc("admin_set_stage", {
    p_secret: secret,
    p_id: id,
    p_stage: stage,
  });
  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function addNote(id: string, body: string): Promise<LeadNote> {
  const secret = secretOrThrow();
  const { data, error } = await getRpcClient().rpc("admin_add_note", {
    p_secret: secret,
    p_id: id,
    p_body: body,
  });
  if (error) throw new Error(error.message);
  return data as LeadNote;
}
