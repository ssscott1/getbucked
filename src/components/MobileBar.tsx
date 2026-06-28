"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useModal } from "./ModalProvider";

/**
 * Sticky bottom CTA for mobile. Appears once the hero has scrolled
 * out of view so there's always a way to start an application.
 */
export function MobileBar() {
  const { openModal, open } = useModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && !open && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream/95 p-3 backdrop-blur md:hidden"
        >
          <button
            type="button"
            onClick={() => openModal({ source: "mobile-bar" })}
            className="w-full rounded-full bg-magenta py-4 text-base font-bold uppercase tracking-wide text-cream active:scale-95"
          >
            Get bucks →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
