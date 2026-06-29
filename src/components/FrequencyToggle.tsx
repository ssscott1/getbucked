"use client";

import { motion } from "framer-motion";
import { FREQUENCIES, type Frequency } from "@/lib/loan";

/** Animated pill toggle for repayment frequency (weekly/fortnightly/monthly). */
export function FrequencyToggle({
  value,
  onChange,
}: {
  value: Frequency;
  onChange: (next: Frequency) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Repayment frequency"
      className="relative inline-flex rounded-full bg-ink/10 p-1"
    >
      {FREQUENCIES.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-6 sm:text-base"
          >
            {active && (
              <motion.span
                layoutId="freq-pill"
                className="absolute inset-0 -z-10 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className={active ? "text-cream" : "text-ink/70"}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
