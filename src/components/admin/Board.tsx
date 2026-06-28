"use client";

import { useMemo, useState, useTransition } from "react";
import { STAGES, type StageKey } from "@/lib/stages";
import { moveStageAction } from "@/lib/admin/actions";
import type { Lead } from "@/lib/admin/data";
import { LeadCard } from "./LeadCard";
import { LeadDrawer } from "./LeadDrawer";
import { PURPOSES } from "@/lib/loan";

export function Board({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<StageKey | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (purpose && l.purpose !== purpose) return false;
      if (!q) return true;
      return (
        (l.first_name ?? "").toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.mobile ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, query, purpose]);

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const s of STAGES) map[s.key] = [];
    for (const l of filtered) (map[l.stage] ??= []).push(l);
    return map;
  }, [filtered]);

  // Optimistically move a card, then persist. Resolves once the server
  // call settles (used by the drawer so it can refresh activity after).
  async function commitMove(id: string, stage: StageKey): Promise<void> {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    const prevStage = lead.stage;
    setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, stage } : l)));
    const res = await moveStageAction(id, stage);
    if (!res.ok) {
      setLeads((cur) =>
        cur.map((l) => (l.id === id ? { ...l, stage: prevStage } : l))
      );
      alert(`Couldn't move that lead: ${res.error}`);
    }
  }

  // Fire-and-forget version for drag/drop + the card menu.
  function moveLead(id: string, stage: StageKey) {
    startTransition(() => {
      void commitMove(id, stage);
    });
  }

  const openLead = leads.find((l) => l.id === openId) ?? null;

  return (
    <>
      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or mobile…"
          aria-label="Search leads"
          className="w-full rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 text-sm font-medium focus:border-magenta focus:outline-none sm:max-w-xs"
        />
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          aria-label="Filter by purpose"
          className="rounded-full border-2 border-ink/15 bg-white px-4 py-2.5 text-sm font-medium focus:border-magenta focus:outline-none"
        >
          <option value="">All purposes</option>
          {PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {(query || purpose) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setPurpose("");
            }}
            className="text-sm font-semibold text-magenta hover:underline"
          >
            Clear
          </button>
        )}
        <span className="text-sm text-ink/50 sm:ml-auto">
          {filtered.length} of {leads.length} shown
        </span>
      </div>

      {/* Board */}
      <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const items = byStage[s.key] ?? [];
          const isOver = overStage === s.key;
          return (
            <section
              key={s.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(s.key);
              }}
              onDragLeave={() => setOverStage((c) => (c === s.key ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverStage(null);
                if (draggingId) moveLead(draggingId, s.key);
                setDraggingId(null);
              }}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors ${
                isOver
                  ? "border-magenta bg-magenta/5"
                  : "border-ink/10 bg-ink/[0.03]"
              }`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  <h2 className="text-sm font-bold">{s.label}</h2>
                  <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink/60">
                    {items.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    dragging={draggingId === lead.id}
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverStage(null);
                    }}
                    onOpen={() => setOpenId(lead.id)}
                    onMove={(stage) => moveLead(lead.id, stage)}
                  />
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-ink/30">
                    {s.blurb}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <LeadDrawer
        lead={openLead}
        onClose={() => setOpenId(null)}
        onMove={async (stage) => {
          if (openId) await commitMove(openId, stage);
        }}
      />
    </>
  );
}
