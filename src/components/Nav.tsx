"use client";

import { useModal } from "./ModalProvider";
import { WinkingEye } from "./WinkingEye";

export function Nav() {
  const { openModal } = useModal();

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 mix-blend-difference"
      // mix-blend-difference keeps the bar legible over any background.
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 text-cream sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 text-2xl font-normal"
          aria-label="Buck Me — home"
        >
          <span className="display text-2xl tracking-tight">Buck</span>
          <WinkingEye className="text-cream text-2xl" />
          <span className="display text-2xl tracking-tight">Me</span>
        </a>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="#how"
            className="hidden text-sm font-semibold hover:opacity-70 sm:inline"
          >
            How it works
          </a>
          <a
            href="#why"
            className="hidden text-sm font-semibold hover:opacity-70 sm:inline"
          >
            Why us
          </a>
          <button
            type="button"
            onClick={() => openModal({ source: "nav" })}
            className="rounded-full border-2 border-cream px-5 py-2 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-105 active:scale-95"
          >
            Get bucks
          </button>
        </div>
      </nav>
    </header>
  );
}
