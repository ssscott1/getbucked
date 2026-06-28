import { requireSession } from "@/lib/admin/auth";
import { listLeads, getStats, type Lead, type StageStats } from "@/lib/admin/data";
import { logoutAction } from "@/lib/admin/actions";
import { Board } from "@/components/admin/Board";
import { PipelineMetrics } from "@/components/admin/PipelineMetrics";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireSession();

  let leads: Lead[] = [];
  let stats: StageStats = {};
  let loadError: string | null = null;
  try {
    [leads, stats] = await Promise.all([listLeads(), getStats()]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
          <div className="flex items-baseline gap-3">
            <span className="display text-2xl">
              Buck Me<span className="text-magenta"> ;)</span>
            </span>
            <span className="text-sm font-semibold text-ink/50">Lead desk</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border-2 border-ink/15 px-4 py-2 text-sm font-bold hover:bg-ink/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-6">
        {loadError ? (
          <div className="rounded-2xl border border-magenta/30 bg-magenta/5 p-6 text-sm">
            <p className="font-bold text-magenta">Couldn&rsquo;t load leads</p>
            <p className="mt-1 text-ink/70">
              The CRM couldn&rsquo;t reach the database. Check that{" "}
              <code className="rounded bg-ink/10 px-1">ADMIN_SECRET</code> and the
              Supabase env vars are set and that outbound access to Supabase is
              allowed.
            </p>
            <p className="mt-2 break-all text-xs text-ink/40">{loadError}</p>
          </div>
        ) : (
          <>
            <PipelineMetrics stats={stats} totalLeads={leads.length} />
            <Board initialLeads={leads} />
          </>
        )}
      </div>
    </main>
  );
}
