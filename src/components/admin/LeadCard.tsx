"use client";

import { formatAUD } from "@/lib/loan";
import { timeAgo } from "@/lib/format";
import { STAGES, type StageKey } from "@/lib/stages";
import type { Lead } from "@/lib/admin/data";

const PURPOSE_LABEL: Record<string, string> = {
  car: "Car",
  rent: "Rent or bills",
  travel: "Travel",
  treat: "Treat",
  other: "Other",
};

export function LeadCard({
  lead,
  dragging,
  onDragStart,
  onDragEnd,
  onOpen,
  onMove,
}: {
  lead: Lead;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onOpen: () => void;
  onMove: (stage: StageKey) => void;
}) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${lead.first_name ?? "Lead"}, ${formatAUD(lead.amount ?? 0)} — open`}
      className={`group cursor-grab rounded-xl border border-ink/10 bg-white p-3 shadow-sm transition active:cursor-grabbing hover:border-ink/25 hover:shadow-md ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold">{lead.first_name ?? "—"}</span>
        <span className="display text-lg text-magenta">
          {formatAUD(lead.amount ?? 0)}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink/60">
        <span className="rounded-full bg-ink/5 px-2 py-0.5 font-medium">
          {PURPOSE_LABEL[lead.purpose ?? ""] ?? lead.purpose ?? "—"}
        </span>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 font-medium capitalize">
          {lead.frequency ?? "—"}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-xs text-ink/40" title={lead.source ?? ""}>
          via {lead.source ?? "—"} · {timeAgo(lead.created_at)}
        </span>
        {/* Accessible / touch move control */}
        <select
          aria-label="Move to stage"
          value={lead.stage}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onMove(e.target.value as StageKey)}
          className="rounded-md border border-ink/15 bg-cream px-1.5 py-1 text-xs font-semibold opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
        >
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
