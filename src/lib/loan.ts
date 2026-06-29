/* ------------------------------------------------------------------ */
/*  Loan maths — SHARED by the calculator, modal and (validation) API. */
/*                                                                     */
/*  Product terms mirror a Plenti-style unsecured personal loan:       */
/*  $5,000–$75,000 over 1–7 years, rates from 6.17% p.a.               */
/*                                                                     */
/*  ⚠️ ILLUSTRATIVE ONLY. Repayments are computed at the headline      */
/*  "from" rate and must never imply a guaranteed rate — the actual    */
/*  rate (6.17%–24.09% p.a.) depends on the assessment. Swap           */
/*  ANNUAL_RATE for a real per-customer rate before going live; it is  */
/*  the single cost-of-credit knob.                                    */
/* ------------------------------------------------------------------ */

// Loan amount range (AUD)
export const MIN_AMOUNT = 5000;
export const MAX_AMOUNT = 75000;
export const AMOUNT_STEP = 1000;
export const DEFAULT_AMOUNT = 30000;

// Loan term range (years)
export const MIN_TERM_YEARS = 1;
export const MAX_TERM_YEARS = 7;
export const DEFAULT_TERM_YEARS = 5;

// Headline / disclosed costs (percentages, for copy + the maths below).
export const HEADLINE_RATE = 6.17; // p.a. "from" rate
export const COMPARISON_RATE = 6.17; // p.a. comparison rate ($30k / 5yr basis)
export const MAX_RATE = 24.09; // p.a. top of the range
export const ESTABLISHMENT_FEE_MAX = 599; // $0–$599, no ongoing/exit fees

// Illustrative interest rate used to amortise the repayment estimate.
export const ANNUAL_RATE = HEADLINE_RATE / 100;

export type Frequency = "weekly" | "fortnightly" | "monthly";

export const FREQUENCIES: { value: Frequency; label: string; perYear: number }[] =
  [
    { value: "weekly", label: "Weekly", perYear: 52 },
    { value: "fortnightly", label: "Fortnightly", perYear: 26 },
    { value: "monthly", label: "Monthly", perYear: 12 },
  ];

export const PURPOSES = [
  { value: "car", label: "Car" },
  { value: "rent", label: "Rent or bills" },
  { value: "travel", label: "Travel" },
  { value: "treat", label: "Treat yourself" },
  { value: "other", label: "Other" },
] as const;

export type Purpose = (typeof PURPOSES)[number]["value"];

function periodsPerYear(frequency: Frequency): number {
  return FREQUENCIES.find((f) => f.value === frequency)?.perYear ?? 12;
}

/** Total number of repayments across the whole term. */
export function periodCount(frequency: Frequency, termYears: number): number {
  return Math.round(periodsPerYear(frequency) * termYears);
}

/**
 * Per-period repayment, rounded to the nearest dollar — a standard
 * amortising loan payment at ANNUAL_RATE over the chosen term. Illustrative.
 */
export function repaymentPerPeriod(
  amount: number,
  frequency: Frequency,
  termYears: number
): number {
  const n = periodCount(frequency, termYears);
  const r = ANNUAL_RATE / periodsPerYear(frequency); // rate per period
  if (r === 0) return Math.round(amount / n);
  const payment = (amount * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment);
}

/** Total repayable across the whole term (illustrative). */
export function totalRepayable(
  amount: number,
  frequency: Frequency,
  termYears: number
): number {
  return repaymentPerPeriod(amount, frequency, termYears) * periodCount(frequency, termYears);
}

/** Snap an arbitrary number to the allowed slider range + step. */
export function clampAmount(value: number): number {
  const stepped = Math.round(value / AMOUNT_STEP) * AMOUNT_STEP;
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, stepped));
}

/** Short label for a repayment period, e.g. "wk", "fn", "mo". */
export function periodUnit(frequency: Frequency): string {
  if (frequency === "weekly") return "wk";
  if (frequency === "fortnightly") return "fn";
  return "mo";
}

/** Format an integer dollar amount as AUD, no cents. */
export function formatAUD(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}
