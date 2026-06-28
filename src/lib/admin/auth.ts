import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Admin session — a signed, httpOnly cookie. One shared secret       */
/*  (ADMIN_SECRET) is the login password, the cookie's HMAC key, and   */
/*  the value passed to the secret-gated admin_* DB functions.         */
/* ------------------------------------------------------------------ */

export const ADMIN_COOKIE = "bm_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET || null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** Build a signed token: base64(exp).hmac */
export function issueToken(secret: string): string {
  const payload = Buffer.from(String(Date.now() + SESSION_TTL_MS)).toString(
    "base64url"
  );
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token: string | undefined, secret: string): boolean {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = Number(Buffer.from(payload, "base64url").toString("utf8"));
  return Number.isFinite(exp) && exp > Date.now();
}

/** True if the request carries a valid admin session. */
export async function hasValidSession(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifyToken(token, secret);
}

/** Constant-time check of a submitted password against ADMIN_SECRET. */
export function passwordMatches(input: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Use at the top of every protected admin page/handler. */
export async function requireSession(): Promise<void> {
  if (!(await hasValidSession())) redirect("/admin/login");
}
