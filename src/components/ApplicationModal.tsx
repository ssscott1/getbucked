"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useModal } from "./ModalProvider";
import { AmountSlider } from "./AmountSlider";
import { TermSlider } from "./TermSlider";
import { FrequencyToggle } from "./FrequencyToggle";
import { LiveAmount } from "./LiveAmount";
import {
  PURPOSES,
  formatAUD,
  repaymentPerPeriod,
  periodUnit,
  type Frequency,
  type Purpose,
} from "@/lib/loan";

type Status = "idle" | "loading" | "success" | "error";
type FieldErrors = Partial<
  Record<"firstName" | "email" | "mobile" | "purpose", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Outer shell — just owns open/close. The dialog body is only mounted
 * while open, so every open is a fresh mount that seeds its own state
 * from the current context values (no state-syncing effects needed).
 */
export function ApplicationModal() {
  const { open, source, amount, frequency, termYears, closeModal } = useModal();

  return (
    <AnimatePresence>
      {open && (
        <ModalDialog
          source={source}
          initialAmount={amount}
          initialFrequency={frequency}
          initialTermYears={termYears}
          onClose={closeModal}
        />
      )}
    </AnimatePresence>
  );
}

function ModalDialog({
  source,
  initialAmount,
  initialFrequency,
  initialTermYears,
  onClose,
}: {
  source: string;
  initialAmount: number;
  initialFrequency: Frequency;
  initialTermYears: number;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  // ---- Form state — persists across back/forward while mounted ----
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState(initialAmount);
  const [termYears, setTermYears] = useState(initialTermYears);
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [purpose, setPurpose] = useState<Purpose | "">("");
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open; restore focus to the trigger on close.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => dialogRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      trigger?.focus?.();
    };
  }, []);

  // Esc to close + focus trap within the dialog.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  function validateStep2(): boolean {
    const next: FieldErrors = {};
    if (!firstName.trim())
      next.firstName = "We just need a first name — promise.";
    if (!EMAIL_RE.test(email.trim()))
      next.email = "Pop in a real email so we can say yes.";
    if (mobile.replace(/\D/g, "").length < 8)
      next.mobile = "A mobile we can text, please.";
    if (!purpose) next.purpose = "What's it for?";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep2()) {
      setStep(2);
      return;
    }
    setStatus("loading");
    setServerError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          amount,
          frequency,
          purpose,
          termMonths: termYears * 12,
          source,
          company, // honeypot
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(
          data?.error ?? "Our end hiccuped — give it one more tap in a sec."
        );
        setStatus("error");
        return;
      }
      setStatus("success");
      setStep(3);
      fireConfetti(reduce);
    } catch {
      setServerError(
        "Couldn't reach us just then — check your connection and retry."
      );
      setStatus("error");
    }
  }

  const purposeLabel = PURPOSES.find((p) => p.value === purpose)?.label ?? "";
  const progress = step === 1 ? "1/3" : step === 2 ? "2/3" : "3/3";

  const slideVariants = reduce
    ? {
        from: { opacity: 1, x: 0 },
        enter: { opacity: 1, x: 0 },
        exit: { opacity: 1, x: 0 },
      }
    : {
        from: { opacity: 0, x: 40 },
        enter: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onKeyDown={onKeyDown}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 text-ink shadow-2xl sm:rounded-3xl sm:p-8"
      >
        {/* Progress + close */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  s <= step ? "bg-magenta" : "bg-ink/15"
                }`}
              />
            ))}
            <span className="ml-2 text-xs font-semibold text-ink/50">
              {progress}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-ink/60 hover:bg-ink/10 hover:text-ink"
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

        <AnimatePresence mode="wait">
          {/* ---------------- STEP 1 — Amount ---------------- */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="from"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 id="modal-heading" className="display text-3xl">
                How much?
              </h2>
              <p className="mt-2 text-sm text-ink/70">
                Slide to your number — change it any time.
              </p>

              <div className="my-6 flex justify-center">
                <LiveAmount amount={amount} className="text-6xl" />
              </div>

              <AmountSlider value={amount} onChange={setAmount} />

              <div className="mt-6">
                <TermSlider years={termYears} onChange={setTermYears} />
              </div>

              <div className="mt-6 flex justify-center">
                <FrequencyToggle value={frequency} onChange={setFrequency} />
              </div>

              <p className="mt-5 text-center text-sm text-ink/70">
                Roughly{" "}
                <span className="font-bold text-ink">
                  {formatAUD(repaymentPerPeriod(amount, frequency, termYears))}/
                  {periodUnit(frequency)}
                </span>{" "}
                over {termYears} {termYears === 1 ? "year" : "years"}.
                Illustrative only.
              </p>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-7 w-full rounded-full bg-magenta py-4 text-lg font-bold uppercase tracking-wide text-cream transition-transform hover:scale-[1.02] active:scale-95"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* ---------------- STEP 2 — Details ---------------- */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="from"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 id="modal-heading" className="display text-3xl">
                Tell us who you are
              </h2>
              <p className="mt-2 text-sm text-ink/70">
                Quick bits so we can text you a yes.
              </p>

              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (validateStep2()) handleSubmit();
                }}
              >
                {/* Honeypot — hidden from real users */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <Field
                  id="firstName"
                  label="First name"
                  value={firstName}
                  onChange={setFirstName}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  id="mobile"
                  label="Mobile"
                  type="tel"
                  value={mobile}
                  onChange={setMobile}
                  error={errors.mobile}
                  autoComplete="tel"
                />

                <div>
                  <label
                    htmlFor="purpose"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    What&rsquo;s it for?
                  </label>
                  <select
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as Purpose)}
                    aria-invalid={!!errors.purpose}
                    className="w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 font-medium focus:border-magenta focus:outline-none"
                  >
                    <option value="" disabled>
                      Pick one…
                    </option>
                    {PURPOSES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {errors.purpose && (
                    <p className="mt-1 text-sm font-medium text-magenta">
                      {errors.purpose}
                    </p>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-ink/60">
                  By continuing you agree to our{" "}
                  <a href="#" className="underline">
                    Privacy Policy
                  </a>{" "}
                  and to us contacting you about your enquiry.
                </p>

                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-xl bg-magenta/10 px-4 py-3 text-sm font-medium text-magenta"
                  >
                    {serverError}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border-2 border-ink/20 px-6 py-3.5 font-bold text-ink hover:bg-ink/5"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-1 rounded-full bg-magenta py-3.5 text-lg font-bold uppercase tracking-wide text-cream transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {status === "loading" ? "Checking…" : "Almost there →"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ---------------- STEP 3 — Pre-approval ---------------- */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="from"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.h2
                id="modal-heading"
                initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
                className="display text-4xl text-magenta"
              >
                You&rsquo;re pre-approved-ish 🎉
              </motion.h2>
              <p className="mx-auto mt-4 max-w-sm text-ink/75">
                Subject to a quick assessment — we&rsquo;ll text you in minutes.
              </p>

              <dl className="mx-auto mt-8 max-w-xs space-y-2 rounded-2xl bg-ink/5 p-5 text-left text-sm">
                <Row label="Amount" value={formatAUD(amount)} />
                <Row
                  label="Term"
                  value={`${termYears} ${termYears === 1 ? "year" : "years"}`}
                />
                <Row
                  label="Repayments"
                  value={
                    frequency.charAt(0).toUpperCase() + frequency.slice(1)
                  }
                />
                <Row label="What for" value={purposeLabel} />
              </dl>

              <button
                type="button"
                onClick={onClose}
                className="mt-8 rounded-full border-2 border-ink px-7 py-3 font-bold text-ink hover:bg-ink hover:text-cream"
              >
                Back to site
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 font-medium focus:border-magenta focus:outline-none"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-magenta">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/60">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

/** Celebration confetti — skipped under reduced-motion. */
async function fireConfetti(reduce: boolean | null) {
  if (reduce) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#FF1F6D", "#FF7A4D", "#FFD9E2"];
  confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors });
  setTimeout(
    () =>
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors,
      }),
    150
  );
  setTimeout(
    () =>
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors,
      }),
    150
  );
}
