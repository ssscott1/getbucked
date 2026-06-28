"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The Buck Me mark — a cheeky ";)" winky face: one open eye, one winking
 * eye, and a smile. The winking eye does a quick "re-wink" roughly every
 * 3s for a bit of life. Honours prefers-reduced-motion by staying still
 * (and still reads as ";)").
 *
 * Draws with `currentColor`, so it inherits whatever text colour it sits
 * in (cream in the nav, magenta in the hero).
 */
export function WinkingEye({
  className = "",
  title = "Buck Me winking face",
}: {
  className?: string;
  title?: string;
}) {
  const reduce = useReducedMotion();

  // The wink: the right eye flicks open to a dot, then closes again.
  // closed line ↔ open dot crossfade, weighted so "open" is brief.
  const closedAnim = reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 1, 1] };
  const openAnim = reduce ? { opacity: 0 } : { opacity: [0, 0, 1, 0, 0] };
  const winkTransition = reduce
    ? undefined
    : {
        duration: 3,
        times: [0, 0.82, 0.88, 0.94, 1] as number[],
        repeat: Infinity,
        ease: "easeInOut" as const,
      };

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="img"
      aria-label={title}
    >
      <svg
        viewBox="0 0 48 48"
        className="h-[0.9em] w-[0.9em] overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Open (left) eye */}
        <circle cx="17.5" cy="19" r="2.6" fill="currentColor" stroke="none" />

        {/* Winking (right) eye — closed line that briefly opens to a dot */}
        <motion.path
          d="M27 20 Q30.5 23 34 20"
          animate={closedAnim}
          transition={winkTransition}
        />
        <motion.circle
          cx="30.5"
          cy="19"
          r="2.6"
          fill="currentColor"
          stroke="none"
          animate={openAnim}
          transition={winkTransition}
        />

        {/* Smile */}
        <path d="M15 28 Q24 37 33 28" />
      </svg>
    </span>
  );
}
