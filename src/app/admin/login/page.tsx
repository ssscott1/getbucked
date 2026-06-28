"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin/actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-cream">
      <div className="w-full max-w-sm">
        <p className="display text-5xl">
          Buck Me<span className="text-magenta"> ;)</span>
        </p>
        <p className="mt-2 text-sm text-cream/60">Lead desk — staff only.</p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold"
            >
              Admin password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              className="w-full rounded-xl border-2 border-cream/15 bg-cream/5 px-4 py-3 font-medium text-cream placeholder:text-cream/30 focus:border-magenta focus:outline-none"
              placeholder="••••••••••••"
            />
          </div>

          {state && !state.ok && (
            <p role="alert" className="text-sm font-medium text-magenta">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-magenta py-3.5 text-lg font-bold uppercase tracking-wide text-cream transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
