"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

type Card = {
  title: string;
  body: string;
  bg: string;
  fg: string;
};

const CARDS: Card[] = [
  {
    title: "Stupidly fast",
    body: "Yes in minutes, not days. Apply from your phone and get an answer before the kettle boils.",
    bg: "bg-ink",
    fg: "text-cream",
  },
  {
    title: "No middle-man markup",
    body: "No brokers clipping the ticket. You deal with us direct, so there's no one in the middle marking it up.",
    bg: "bg-magenta",
    fg: "text-cream",
  },
  {
    title: "Repay like a grown-up",
    body: "Weekly, fortnightly, or all-of-it-Friday. Pay early and we celebrate — never penalise.",
    bg: "bg-blush",
    fg: "text-ink",
  },
];

function TiltCard({ card, index }: { card: Card; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rx = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 });
  const transform = useMotionTemplate`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 12);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ transform: reduce ? undefined : transform }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className={`${card.bg} ${card.fg} flex min-h-[18rem] flex-col justify-between rounded-3xl p-8 will-change-transform`}
    >
      <span className="text-sm font-bold opacity-60">0{index + 1}</span>
      <div>
        <h3 className="display text-3xl sm:text-4xl">{card.title}</h3>
        <p className="mt-4 text-base font-medium opacity-90">{card.body}</p>
      </div>
    </motion.div>
  );
}

export function ValueCards() {
  return (
    <section id="why" className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="display mb-12 text-center text-5xl sm:text-6xl">
          Why us
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <TiltCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
