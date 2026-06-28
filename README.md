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

Set these in `.env.local` (git-ignored), and in your host (e.g. Netlify →
Site settings → Environment variables). Supabase values are in
**Supabase → Project Settings → API**.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon key. Safe to expose. |
| `ADMIN_SECRET` | yes (for `/admin`) | The CRM login password **and** the secret used to reach the gated `admin_*` DB functions. Must match the value stored in `public.admin_config`. Generate with `openssl rand -hex 24`. |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Not needed — the app never uses a service-role key. Left in `.env.example` only for reference. |

If the Supabase vars are missing at runtime, the lead API fails gracefully with
a clear console message instead of crashing.

## Database

Migrations live in [`supabase/migrations/`](supabase/migrations). They create:

- `public.leads` — the lead/pipeline table (adds a `stage` column + audit
  `updated_at`).
- `public.lead_notes`, `public.lead_events` — CRM notes and an activity log.
- `public.admin_config` — holds the single admin secret.
- `submit_lead(...)` — the public form's write path.
- `admin_*(...)` — the CRM's read/write functions, gated by the secret.

**Security model (no service-role key anywhere):** every table has RLS **on**
with no public policies, so the anon key can't read or write tables directly.
All access goes through `SECURITY DEFINER` functions: `submit_lead` validates
and inserts a lead (public), and the `admin_*` functions require `ADMIN_SECRET`
(checked against `admin_config`) before returning or changing anything.

After running migration `0002` on a fresh project, seed the secret once
(not in source control):

```sql
insert into public.admin_config (secret) values ('<your ADMIN_SECRET>');
```

To verify a submitted lead, open **Supabase → Table editor → `leads`** (or just
open `/admin`); each completed application inserts one row with `source` = which
CTA opened the form and `stage` = `new`.

## CRM — `/admin`

A password-protected lead desk at **`/admin`** (sign in with `ADMIN_SECRET`):

- **Kanban pipeline** across six stages — New → Contacted → Qualified →
  Approved → Funded, plus Lost. Drag cards between columns (or use the per-card
  menu / the drawer's stage selector); moves are optimistic and persisted.
- **Pipeline KPIs** — leads in pipeline, open pipeline value, funded value.
- **Lead drawer** — full contact details (click-to-email / click-to-call),
  notes, and an automatic **activity timeline** (created, stage changes, notes).
- **Search & filter** by name/email/mobile and purpose.

Stages are defined in one place — `src/lib/stages.ts`.

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
  where new leads go (it calls the `submit_lead` RPC). To move capture from
  Supabase to HubSpot / Salesforce / a webhook, rewrite that function's body
  and nothing else changes. The admin/CRM read+write layer is similarly
  isolated in `src/lib/admin/data.ts`.
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
