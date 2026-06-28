"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The Buck Me eye mark — blinks (winks) roughly every 3s.
 * Honours prefers-reduced-motion by staying open.
 */
export function WinkingEye({
  className = "",
  title = "Buck Me winking eye",
}: {
  className?: string;
  title?: string;
}) {
  const reduce = useReducedMotion();

  // Eyelid scales down vertically to "wink", then snaps back open.
  const lidAnim = reduce
    ? { scaleY: 1 }
    : { scaleY: [1, 1, 0.08, 1, 1] };

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="img"
      aria-label={title}
    >
      <svg
        viewBox="0 0 48 48"
        className="h-[1em] w-[1em] overflow-visible"
        aria-hidden="true"
      >
        {/* White of the eye */}
        <circle cx="24" cy="24" r="22" fill="currentColor" />
        {/* Iris + pupil that winks shut */}
        <motion.g
          style={{ originX: "24px", originY: "24px" }}
          animate={lidAnim}
          transition={
            reduce
              ? undefined
              : {
                  duration: 3,
                  times: [0, 0.85, 0.9, 0.95, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <circle cx="24" cy="24" r="11" fill="#141014" />
          <circle cx="20" cy="20" r="3.5" fill="#FBF3EC" />
        </motion.g>
      </svg>
    </span>
  );
}
