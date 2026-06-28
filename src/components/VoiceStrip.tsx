"use client";

import { motion } from "framer-motion";

export function VoiceStrip() {
  return (
    <section className="bg-coral px-5 py-24 sm:px-8 sm:py-32">
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="display mx-auto max-w-5xl text-center text-4xl text-ink sm:text-6xl"
      >
        Life happens. Rent&rsquo;s due, the car died, your mate&rsquo;s
        wedding is{" "}
        <span className="text-cream">this weekend</span>. We get it. Buck me.
      </motion.p>
    </section>
  );
}
