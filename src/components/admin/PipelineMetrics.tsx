import { formatAUD } from "@/lib/loan";
import { STAGES } from "@/lib/stages";
import type { StageStats } from "@/lib/admin/data";

/**
 * Top-line pipeline KPIs: total leads, live pipeline value (everything
 * not lost/funded), and money funded. Pure render — no client JS.
 */
export function PipelineMetrics({
  stats,
  totalLeads,
}: {
  stats: StageStats;
  totalLeads: number;
}) {
  const amountFor = (key: string) => stats[key]?.amount ?? 0;
  const countFor = (key: string) => stats[key]?.count ?? 0;

  const livePipeline = STAGES.filter(
    (s) => !("done" in s && s.done) && !("lost" in s && s.lost)
  ).reduce((sum, s) => sum + amountFor(s.key), 0);

  const funded = amountFor("funded");
  const fundedCount = countFor("funded");

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Kpi label="Leads in pipeline" value={String(totalLeads)} />
      <Kpi label="Open pipeline value" value={formatAUD(livePipeline)} accent />
      <Kpi label="Funded value" value={formatAUD(funded)} />
      <Kpi label="Deals funded" value={String(fundedCount)} />
    </section>
  );
}

function Kpi({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
        {label}
      </p>
      <p
        className={`display mt-1 text-2xl ${accent ? "text-magenta" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
