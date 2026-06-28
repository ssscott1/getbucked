# Buck Me — landing page + lead capture

A single-page marketing site for **Buck Me**, a cheeky Australian small
personal-loan brand. Its one job: get visitors to start and submit a
loan-interest application, with leads written to Supabase.

Built with **Next.js 16 (App Router, TypeScript, `src/`)**, **Tailwind CSS v4**,
**Framer Motion**, **canvas-confetti**, and **@supabase/supabase-js**.

---

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

## Environment variables

Set these in `.env.local` (git-ignored). Find them in
**Supabase → Project Settings → API**.

| Variable | Where it's used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Anon/publishable key. Safe to expose. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used by the lead-write path to bypass RLS. **Never** commit it or import it into client code. |

If the server vars are missing at runtime, the lead API fails gracefully with
a clear console message instead of crashing.

## Database

The app depends on a `public.leads` table. The migration lives in
[`supabase/migrations/0001_create_leads.sql`](supabase/migrations/0001_create_leads.sql).
RLS is **on** with no public policies — all writes happen server-side using the
service-role key.

To verify a submitted lead, open **Supabase → Table editor → `leads`**; each
completed application inserts one row (name, email, mobile, amount, frequency,
purpose, `source` = which CTA opened the form, `status` = `new`).

## Scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build + type-check
npm run start   # serve the production build
npm run lint    # eslint
```

## Where to change things

- **Repayment maths** — `src/lib/loan.ts`. The illustrative cost factor is the
  single constant `REPAYMENT_FACTOR` (and `TERM_WEEKS`). All figures on the
  site are illustrative only; swap this for a real comparison-rate calculation
  before going live.
- **CRM / lead storage** — `src/lib/leads.ts` is the **only** file that knows
  where leads go. It exposes one function, `createLead(input)`. To move from
  Supabase to HubSpot / Salesforce / a webhook, rewrite that function's body
  and nothing else changes. Keep the `LeadInput` shape and `{ ok }` return.
- **Brand tokens** — `src/app/globals.css` `@theme` block (Tailwind v4
  CSS-based config). Colours become utilities like `bg-ink`, `text-magenta`;
  fonts are `font-display` / `font-body`.

## Architecture notes

- `src/app/api/lead/route.ts` — POST endpoint: validates input (email shape,
  amount $300–$2,000, frequency enum, required name), checks a honeypot field,
  then calls `createLead()`.
- `src/components/ModalProvider.tsx` — context that lets any CTA open the
  multi-step application modal, passing a `source` tag and optional prefilled
  amount/frequency.
- Accessibility: visible keyboard focus, ARIA labels, focus-trapped modal,
  and `prefers-reduced-motion` disables all animation (incl. confetti).

> This is a demonstration project. "Australian Credit Licence pending" — no
> credit is actually offered. All copy and repayment figures are illustrative.
