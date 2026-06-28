/* ------------------------------------------------------------------ */
/*  CRM pipeline stages — the single source of truth for the board.    */
/*  Order here is the order columns appear. `accent` is a Tailwind     */
/*  colour utility fragment; `done`/`lost` flag terminal columns.      */
/* ------------------------------------------------------------------ */

export const STAGES = [
  { key: "new", label: "New", blurb: "Just landed", dot: "bg-magenta" },
  { key: "contacted", label: "Contacted", blurb: "Reached out", dot: "bg-coral" },
  { key: "qualified", label: "Qualified", blurb: "Good fit", dot: "bg-amber-400" },
  { key: "approved", label: "Approved", blurb: "Green-lit", dot: "bg-sky-400" },
  { key: "funded", label: "Funded", blurb: "Money out 🎉", dot: "bg-emerald-500", done: true },
  { key: "lost", label: "Lost", blurb: "Didn't proceed", dot: "bg-ink/30", lost: true },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const STAGE_KEYS: StageKey[] = STAGES.map((s) => s.key);

export function isStage(value: string): value is StageKey {
  return (STAGE_KEYS as string[]).includes(value);
}

export function stageMeta(key: string) {
  return STAGES.find((s) => s.key === key) ?? STAGES[0];
}
