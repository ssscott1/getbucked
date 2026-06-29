"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useModal } from "./ModalProvider";
import { AmountSlider } from "./AmountSlider";
import { TermSlider } from "./TermSlider";
import { FrequencyToggle } from "./FrequencyToggle";
import { LiveAmount } from "./LiveAmount";
import {
  DEFAULT_AMOUNT,
  DEFAULT_TERM_YEARS,
  COMPARISON_RATE,
  HEADLINE_RATE,
  ESTABLISHMENT_FEE_MAX,
  formatAUD,
  repaymentPerPeriod,
  periodUnit,
  type Frequency,
} from "@/lib/loan";

export function LoanCalculator() {
  const { openModal } = useModal();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [termYears, setTermYears] = useState(DEFAULT_TERM_YEARS);
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  const perPeriod = repaymentPerPeriod(amount, frequency, termYears);
  const unit = periodUnit(frequency);

  return (
    <section id="how" className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coral">
          Slide to flirt with a number
        </p>
        <h2 className="display mt-3 text-5xl sm:text-6xl">
          How much do you want?
        </h2>

        {/* Giant live figure */}
        <div className="mt-10 flex justify-center">
          <LiveAmount amount={amount} className="text-7xl sm:text-8xl" />
        </div>

        {/* Amount slider */}
        <div className="mt-8">
          <AmountSlider value={amount} onChange={setAmount} />
        </div>

        {/* Term slider */}
        <div className="mt-8">
          <TermSlider years={termYears} onChange={setTermYears} />
        </div>

        {/* Frequency toggle */}
        <div className="mt-8 flex justify-center">
          <FrequencyToggle value={frequency} onChange={setFrequency} />
        </div>

        {/* Repayment line — illustrative */}
        <p className="mx-auto mt-8 max-w-md text-lg font-medium text-ink/80">
          Roughly{" "}
          <span className="font-bold text-ink">
            {formatAUD(perPeriod)}/{unit}
          </span>{" "}
          over {termYears} {termYears === 1 ? "year" : "years"}. Pay early, pay
          less — no exit fee.
        </p>
        <p className="mx-auto mt-2 max-w-lg text-xs text-ink/50">
          Illustrative only at {HEADLINE_RATE}% p.a. ({COMPARISON_RATE}%
          comparison rate). Your rate (6.17%–24.09% p.a.) depends on a quick
          assessment. Establishment fee $0–${ESTABLISHMENT_FEE_MAX}; no monthly
          or early-repayment fees.
        </p>

        {/* CTA — label tracks the amount */}
        <button
          type="button"
          onClick={() =>
            openModal({ source: "calculator", amount, frequency, termYears })
          }
          className="mt-8 rounded-full bg-magenta px-9 py-4 text-lg font-bold uppercase tracking-wide text-cream shadow-lg shadow-magenta/30 transition-transform hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
        >
          Buck me {formatAUD(amount)} →
        </button>
      </motion.div>
    </section>
  );
}
