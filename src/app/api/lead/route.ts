import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { notifyNewLead } from "@/lib/notify";
import {
  MIN_AMOUNT,
  MAX_AMOUNT,
  PURPOSES,
  type Frequency,
  type Purpose,
} from "@/lib/loan";

export const runtime = "nodejs";

// Basic email shape — intentionally permissive, not RFC-perfect.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREQUENCIES: Frequency[] = ["weekly", "fortnightly"];
const PURPOSE_VALUES = PURPOSES.map((p) => p.value);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't read that — give it another go." },
      { status: 400 }
    );
  }

  // Honeypot: real users never fill this hidden field. Pretend success
  // so bots don't learn anything, but write nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const firstName = String(body.firstName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const mobile = String(body.mobile ?? "").trim();
  const amount = Number(body.amount);
  const frequency = String(body.frequency ?? "") as Frequency;
  const purpose = String(body.purpose ?? "") as Purpose;
  const source = String(body.source ?? "unknown").slice(0, 60);

  // ---- Server-side validation (never trust the client) ----
  if (!firstName) {
    return fail("Pop your first name in so we know who to say yes to.");
  }
  if (!EMAIL_RE.test(email)) {
    return fail("Pop in a real email so we can say yes.");
  }
  if (!mobile || mobile.replace(/\D/g, "").length < 8) {
    return fail("We need a mobile we can text — double-check that one.");
  }
  if (
    !Number.isFinite(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return fail(`Pick an amount between $${MIN_AMOUNT} and $${MAX_AMOUNT}.`);
  }
  if (!FREQUENCIES.includes(frequency)) {
    return fail("Choose weekly or fortnightly.");
  }
  if (!PURPOSE_VALUES.includes(purpose)) {
    return fail("Let us know what it's for.");
  }

  const result = await createLead({
    firstName,
    email,
    mobile,
    amount: Math.round(amount),
    frequency,
    purpose,
    source,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Our end hiccuped — give it one more tap in a sec.",
      },
      { status: 502 }
    );
  }

  // Best-effort new-lead email. Awaited (so it runs to completion on
  // serverless) but it never throws, so it can't fail the submission.
  await notifyNewLead({
    firstName,
    email,
    mobile,
    amount: Math.round(amount),
    frequency,
    purpose,
    source,
  });

  return NextResponse.json({ ok: true, id: result.id });
}

function fail(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
