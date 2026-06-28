"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useModal } from "./ModalProvider";
import { WinkingEye } from "./WinkingEye";

export function Hero() {
  const { openModal } = useModal();
  const reduce = useReducedMotion();

  // Staggered entrance: headline → subhead → CTAs.
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.14, delayChildren: 0.1 },
    },
  };
  const rise = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden bg-cream pt-24"
    >
      {/* Soft blush radial glow, top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[42rem] w-[42rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,217,226,0.9) 0%, rgba(255,217,226,0) 70%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto w-full max-w-6xl px-5 sm:px-8"
      >
        <motion.p
          variants={rise}
          className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-magenta"
        >
          Personal loans · zero awkward
        </motion.p>

        <motion.h1
          variants={rise}
          className="display text-ink text-[22vw] leading-[0.82] sm:text-[16vw] lg:text-[12rem]"
        >
          Buck{" "}
          <span className="whitespace-nowrap text-magenta">
            Me
            <WinkingEye className="ml-2 align-baseline text-magenta" />
          </span>
        </motion.h1>

        <motion.p
          variants={rise}
          className="mt-6 max-w-[540px] text-lg font-medium text-ink/80 sm:text-xl"
        >
          Cash that says yes. No broker, no begging, no &ldquo;let me check
          with my manager.&rdquo; Approved before you&rsquo;ve changed your
          mind.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            onClick={() => openModal({ source: "hero" })}
            className="rounded-full bg-magenta px-8 py-4 text-lg font-bold uppercase tracking-wide text-cream shadow-lg shadow-magenta/30 transition-transform hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
          >
            Get me bucks →
          </button>
          <a
            href="#how"
            className="rounded-full border-2 border-ink px-8 py-4 text-center text-lg font-bold lowercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            how this works
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
