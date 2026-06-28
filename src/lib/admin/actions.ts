"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  getAdminSecret,
  hasValidSession,
  issueToken,
  passwordMatches,
} from "./auth";
import { addNote, setStage } from "./data";
import { isStage } from "@/lib/stages";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Log in: verify the password, set a signed session cookie. */
export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const secret = getAdminSecret();
  if (!secret) {
    return { ok: false, error: "Admin isn't configured (missing ADMIN_SECRET)." };
  }
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    return { ok: false, error: "Wrong password — try again." };
  }
  (await cookies()).set(ADMIN_COOKIE, issueToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/** Move a lead to a new pipeline stage (logs an activity event server-side). */
export async function moveStageAction(
  id: string,
  stage: string
): Promise<ActionResult> {
  if (!(await hasValidSession())) return { ok: false, error: "Not signed in." };
  if (!isStage(stage)) return { ok: false, error: "Unknown stage." };
  try {
    await setStage(id, stage);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Add a note to a lead. */
export async function addNoteAction(
  id: string,
  body: string
): Promise<ActionResult> {
  if (!(await hasValidSession())) return { ok: false, error: "Not signed in." };
  if (!body.trim()) return { ok: false, error: "Note can't be empty." };
  try {
    await addNote(id, body.trim());
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
