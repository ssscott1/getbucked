/* ------------------------------------------------------------------ */
/*  Loan maths — SHARED by the calculator, modal and (validation) API. */
/*                                                                     */
/*  ⚠️ ILLUSTRATIVE ONLY. These figures are a rough indication, not a  */
/*  quote, and must never imply a guaranteed rate. The single factor   */
/*  below is a placeholder — replace REPAYMENT_FACTOR with a real      */
/*  comparison-rate-based calculation before going live.               */
/* ------------------------------------------------------------------ */

export const MIN_AMOUNT = 300;
export const MAX_AMOUNT = 2000;
export const AMOUNT_STEP = 50;
export const DEFAULT_AMOUNT = 750;

// Loan is illustrated over a fixed 12-week term.
export const TERM_WEEKS = 12;

// Placeholder cost-of-credit factor. amount * FACTOR = total repayable.
// Swap this for a real comparison-rate calc — keep it the only knob.
export const REPAYMENT_FACTOR = 1.14;

export type Frequency = "weekly" | "fortnightly";

export const PURPOSES = [
  { value: "car", label: "Car" },
  { value: "rent", label: "Rent or bills" },
  { value: "travel", label: "Travel" },
  { value: "treat", label: "Treat yourself" },
  { value: "other", label: "Other" },
] as const;

export type Purpose = (typeof PURPOSES)[number]["value"];

/** Total repayable across the whole term (illustrative). */
export function totalRepayable(amount: number): number {
  return amount * REPAYMENT_FACTOR;
}

/**
 * Per-period repayment, rounded to the nearest dollar.
 * Weekly = 12 payments, fortnightly = 6 payments over the same term.
 */
export function repaymentPerPeriod(amount: number, frequency: Frequency): number {
  const periods = frequency === "weekly" ? TERM_WEEKS : TERM_WEEKS / 2;
  return Math.round(totalRepayable(amount) / periods);
}

/** Number of repayments for the chosen frequency. */
export function periodCount(frequency: Frequency): number {
  return frequency === "weekly" ? TERM_WEEKS : TERM_WEEKS / 2;
}

/** Snap an arbitrary number to the allowed slider range + step. */
export function clampAmount(value: number): number {
  const stepped = Math.round(value / AMOUNT_STEP) * AMOUNT_STEP;
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, stepped));
}

/** Format an integer dollar amount as AUD, no cents. */
export function formatAUD(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}
