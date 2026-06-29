"use client";

import { MIN_AMOUNT, MAX_AMOUNT, AMOUNT_STEP, formatAUD } from "@/lib/loan";

/**
 * Custom range slider, $5,000–$75,000 in $1,000 steps.
 * The filled portion of the track is driven by the `--fill` CSS var.
 */
export function AmountSlider({
  value,
  onChange,
  id = "amount-slider",
}: {
  value: number;
  onChange: (next: number) => void;
  id?: string;
}) {
  const fillPct =
    ((value - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  return (
    <div className="w-full">
      <input
        id={id}
        type="range"
        min={MIN_AMOUNT}
        max={MAX_AMOUNT}
        step={AMOUNT_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="buck-slider"
        style={{ ["--fill" as string]: `${fillPct}%` }}
        aria-label="Loan amount"
        aria-valuetext={formatAUD(value)}
      />
      <div className="mt-3 flex justify-between text-sm font-medium text-ink/60">
        <span>{formatAUD(MIN_AMOUNT)}</span>
        <span>{formatAUD(MAX_AMOUNT)}</span>
      </div>
    </div>
  );
}
