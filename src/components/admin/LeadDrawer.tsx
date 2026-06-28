"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatAUD } from "@/lib/loan";
import { fullTime, timeAgo } from "@/lib/format";
import { STAGES, stageMeta, type StageKey } from "@/lib/stages";
import { addNoteAction } from "@/lib/admin/actions";
import type { Lead, LeadDetail } from "@/lib/admin/data";

export function LeadDrawer({
  lead,
  onClose,
  onMove,
}: {
  lead: Lead | null;
  onClose: () => void;
  onMove: (stage: StageKey) => Promise<void>;
}) {
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const id = lead?.id;

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setDetail(null);
      try {
        const r = await fetch(`/api/admin/lead/${id}`, { signal: ac.signal });
        const d = await r.json();
        if (!ac.signal.aborted && d && !d.error) setDetail(d);
      } catch {
        /* aborted or network error — drawer shows what it has */
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  async function refetch() {
    if (!id) return;
    const d = await fetch(`/api/admin/lead/${id}`).then((r) => r.json());
    if (d && !d.error) setDetail(d);
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !note.trim()) return;
    setSaving(true);
    const res = await addNoteAction(id, note);
    setSaving(false);
    if (res.ok) {
      setNote("");
      await refetch();
    } else {
      alert(res.error);
    }
  }

  async function changeStage(stage: StageKey) {
    await onMove(stage);
    await refetch();
  }

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-ink/40"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.aside
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="h-full w-full max-w-md overflow-y-auto bg-cream p-6 text-ink shadow-2xl"
            role="dialog"
            aria-label={`${lead.first_name ?? "Lead"} details`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="display text-3xl">{lead.first_name ?? "—"}</h2>
                <p className="mt-1 text-sm text-ink/50">
                  Applied {timeAgo(lead.created_at)} · via {lead.source ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 text-ink/60 hover:bg-ink/10"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Headline figure */}
            <div className="mt-5 rounded-2xl bg-ink p-5 text-cream">
              <p className="text-xs font-semibold uppercase tracking-wide text-cream/50">
                Requested
              </p>
              <p className="display text-4xl text-magenta">
                {formatAUD(lead.amount ?? 0)}
              </p>
              <p className="mt-1 text-sm capitalize text-cream/70">
                {lead.frequency} repayments · {lead.purpose}
              </p>
            </div>

            {/* Stage control */}
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
              Stage
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${stageMeta(lead.stage).dot}`} />
              <select
                value={lead.stage}
                onChange={(e) => changeStage(e.target.value as StageKey)}
                className="flex-1 rounded-xl border-2 border-ink/15 bg-white px-3 py-2.5 font-semibold focus:border-magenta focus:outline-none"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact */}
            <div className="mt-5 grid grid-cols-1 gap-2">
              <ContactRow
                label="Email"
                value={lead.email ?? "—"}
                href={lead.email ? `mailto:${lead.email}` : undefined}
              />
              <ContactRow
                label="Mobile"
                value={lead.mobile ?? "—"}
                href={lead.mobile ? `tel:${lead.mobile.replace(/\s/g, "")}` : undefined}
              />
            </div>

            {/* Notes */}
            <h3 className="mt-7 text-sm font-bold uppercase tracking-wide text-ink/50">
              Notes
            </h3>
            <form onSubmit={submitNote} className="mt-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Add a note — call outcome, next step…"
                className="w-full resize-none rounded-xl border-2 border-ink/15 bg-white px-3 py-2 text-sm focus:border-magenta focus:outline-none"
              />
              <button
                type="submit"
                disabled={saving || !note.trim()}
                className="mt-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream disabled:opacity-40"
              >
                {saving ? "Saving…" : "Add note"}
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {detail?.notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-ink/10 bg-white p-3 text-sm"
                >
                  <p>{n.body}</p>
                  <p className="mt-1 text-xs text-ink/40">
                    {n.author} · {timeAgo(n.created_at)}
                  </p>
                </div>
              ))}
              {detail && detail.notes.length === 0 && (
                <p className="text-sm text-ink/40">No notes yet.</p>
              )}
            </div>

            {/* Activity timeline */}
            <h3 className="mt-7 text-sm font-bold uppercase tracking-wide text-ink/50">
              Activity
            </h3>
            <ol className="mt-3 space-y-3 border-l-2 border-ink/10 pl-4">
              {loading && <li className="text-sm text-ink/40">Loading…</li>}
              {detail?.events.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-magenta" />
                  <p className="text-sm font-medium">{describeEvent(ev)}</p>
                  <p className="text-xs text-ink/40" title={fullTime(ev.created_at)}>
                    {timeAgo(ev.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm">
      <span className="text-ink/50">{label}</span>
      {href ? (
        <a href={href} className="font-semibold text-magenta hover:underline">
          {value}
        </a>
      ) : (
        <span className="font-semibold">{value}</span>
      )}
    </div>
  );
}

function describeEvent(ev: LeadDetail["events"][number]): string {
  if (ev.type === "created") return "Lead created";
  if (ev.type === "stage_changed") {
    return `Moved ${ev.from_stage ? stageMeta(ev.from_stage).label : "?"} → ${
      ev.to_stage ? stageMeta(ev.to_stage).label : "?"
    }`;
  }
  if (ev.type === "note_added") return `Note added: ${ev.detail ?? ""}`;
  return ev.type;
}
