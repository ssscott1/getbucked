import "server-only";
import { formatAUD, type Frequency, type Purpose } from "./loan";

/* ------------------------------------------------------------------ */
/*  New-lead email notifications via Resend (https://resend.com).      */
/*                                                                     */
/*  Best-effort: a failure here never blocks lead capture — the lead   */
/*  is already saved and the visitor already sees their confirmation.  */
/*  We call Resend's REST API directly (no extra dependency).          */
/*                                                                     */
/*  Env:                                                               */
/*   • RESEND_API_KEY   — required to actually send (else we skip).    */
/*   • LEAD_NOTIFY_TO   — recipient (default scott.iriks@gmail.com).   */
/*   • LEAD_NOTIFY_FROM — sender (default Resend's shared onboarding    */
/*     address, which sends to your own Resend account email without   */
/*     domain verification; swap for a verified domain to send wider). */
/*   • NEXT_PUBLIC_SITE_URL — if set, adds a deep link to /admin.      */
/* ------------------------------------------------------------------ */

const PURPOSE_LABEL: Record<string, string> = {
  car: "Car",
  rent: "Rent or bills",
  travel: "Travel",
  treat: "Treat yourself",
  other: "Other",
};

export type LeadNotification = {
  firstName: string;
  email: string;
  mobile: string;
  amount: number;
  frequency: Frequency;
  purpose: Purpose;
  termMonths: number;
  source: string;
};

export async function notifyNewLead(lead: LeadNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[notify] RESEND_API_KEY not set — skipping lead email.");
    return;
  }

  const to = process.env.LEAD_NOTIFY_TO || "scott.iriks@gmail.com";
  const from = process.env.LEAD_NOTIFY_FROM || "Buck Me <onboarding@resend.dev>";
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const adminUrl = site ? `${site}/admin` : undefined;

  const amount = formatAUD(lead.amount);
  const purpose = PURPOSE_LABEL[lead.purpose] ?? lead.purpose;
  const subject = `💸 New lead: ${lead.firstName} wants ${amount}`;

  const termYears = Math.round(lead.termMonths / 12);
  const rows: [string, string][] = [
    ["Name", lead.firstName],
    ["Amount", `${amount} over ${termYears} yr (${lead.frequency})`],
    ["For", purpose],
    ["Email", lead.email],
    ["Mobile", lead.mobile],
    ["Came via", lead.source],
  ];

  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (adminUrl ? `\n\nManage in the CRM: ${adminUrl}` : "");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px">
      <h2 style="margin:0 0 4px">New Buck Me lead</h2>
      <p style="margin:0 0 16px;color:#555">
        <strong>${escapeHtml(lead.firstName)}</strong> wants
        <strong style="color:#FF1F6D">${amount}</strong> (${lead.frequency})
        for ${escapeHtml(purpose)}.
      </p>
      <table style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 12px 4px 0;color:#888">${k}</td>` +
              `<td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`
          )
          .join("")}
      </table>
      ${
        adminUrl
          ? `<p style="margin-top:20px">
               <a href="${adminUrl}" style="background:#FF1F6D;color:#fff;
                  text-decoration:none;padding:10px 18px;border-radius:999px;
                  font-weight:bold">Open the lead desk →</a>
             </p>`
          : ""
      }
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text, html }),
    });
    if (!res.ok) {
      console.error(
        "[notify] email send failed:",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error("[notify] email error:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
