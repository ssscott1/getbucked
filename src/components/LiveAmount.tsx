"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatAUD } from "@/lib/loan";

/**
 * The giant live dollar figure (Archivo Black, magenta) that does a
 * subtle scale "pop" each time the amount changes.
 */
export function LiveAmount({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={amount}
      initial={reduce ? false : { scale: 0.92 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 18 }}
      className={`display text-magenta tabular-nums ${className}`}
    >
      {formatAUD(amount)}
    </motion.div>
  );
}
