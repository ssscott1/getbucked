"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The Buck Me mark — the literal ";)" emoticon, a semicolon + bracket.
 * It winks roughly every 3s: the eye glyph flicks from ";" (winking) to
 * ":" (open) and back. Rendered as text in the display font with
 * currentColor, so it inherits its surrounding size and colour.
 * Honours prefers-reduced-motion by holding a static ";)".
 */
export function WinkingEye({
  className = "",
  title = "Buck Me winky face",
}: {
  className?: string;
  title?: string;
}) {
  const reduce = useReducedMotion();

  // Crossfade the eye between ";" (winking, default) and ":" (open).
  // Weighted so it sits as ";" almost the whole time, opening briefly.
  const winkAnim = reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 1, 1] };
  const openAnim = reduce ? { opacity: 0 } : { opacity: [0, 0, 1, 0, 0] };
  const transition = reduce
    ? undefined
    : {
        duration: 3,
        times: [0, 0.82, 0.88, 0.94, 1] as number[],
        repeat: Infinity,
        ease: "easeInOut" as const,
      };

  return (
    <span
      className={`font-display inline-flex items-baseline ${className}`}
      role="img"
      aria-label={title}
    >
      {/* The winking eye: ";" and ":" stacked so they swap with no shift */}
      <span className="relative inline-block" aria-hidden="true">
        <span className="invisible">;</span>
        <motion.span
          className="absolute inset-0"
          animate={winkAnim}
          transition={transition}
        >
          ;
        </motion.span>
        <motion.span
          className="absolute inset-0"
          animate={openAnim}
          transition={transition}
        >
          :
        </motion.span>
      </span>
      <span aria-hidden="true">)</span>
    </span>
  );
}
