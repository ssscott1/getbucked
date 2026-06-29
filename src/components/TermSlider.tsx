"use client";

import { MIN_TERM_YEARS, MAX_TERM_YEARS } from "@/lib/loan";

/** Loan term selector, 1–7 years in whole-year steps. */
export function TermSlider({
  years,
  onChange,
  id = "term-slider",
}: {
  years: number;
  onChange: (next: number) => void;
  id?: string;
}) {
  const fillPct =
    ((years - MIN_TERM_YEARS) / (MAX_TERM_YEARS - MIN_TERM_YEARS)) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink/60">Loan term</span>
        <span className="font-bold text-ink">
          {years} {years === 1 ? "year" : "years"}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={MIN_TERM_YEARS}
        max={MAX_TERM_YEARS}
        step={1}
        value={years}
        onChange={(e) => onChange(Number(e.target.value))}
        className="buck-slider"
        style={{ ["--fill" as string]: `${fillPct}%` }}
        aria-label="Loan term in years"
        aria-valuetext={`${years} years`}
      />
      <div className="mt-3 flex justify-between text-sm font-medium text-ink/60">
        <span>{MIN_TERM_YEARS} yr</span>
        <span>{MAX_TERM_YEARS} yrs</span>
      </div>
    </div>
  );
}
