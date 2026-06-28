"use client";

import { useModal } from "./ModalProvider";

export function Footer() {
  const { openModal } = useModal();

  return (
    <footer className="bg-ink px-5 py-20 text-cream sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-cream/15 pb-14 md:flex-row md:items-end">
          <h2 className="display text-6xl sm:text-7xl lg:text-8xl">
            Ready when
            <br />
            you are.
          </h2>
          <button
            type="button"
            onClick={() => openModal({ source: "footer" })}
            className="rounded-full bg-magenta px-9 py-4 text-lg font-bold uppercase tracking-wide text-cream shadow-lg shadow-magenta/30 transition-transform hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
          >
            Get me bucks →
          </button>
        </div>

        {/* Calm, trustworthy fine print */}
        <div className="mt-12 grid gap-10 text-sm text-cream/70 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4 leading-relaxed">
            <p className="font-semibold text-cream">Borrow only what you can repay.</p>
            <p>
              Buck Me offers small personal loans to eligible Australian
              residents. All applications are subject to a suitability and
              affordability assessment — applying does not guarantee approval,
              and any repayment figures shown on this site are illustrative
              only and not an offer of credit. Consider whether a loan is right
              for you and read the terms before applying.
            </p>
            <p>
              Australian Credit Licence pending. Buck Me is committed to
              responsible lending under the National Consumer Credit Protection
              Act 2009.
            </p>
          </div>
          <nav aria-label="Footer" className="space-y-3">
            <a href="#" className="block hover:text-cream">
              Privacy Policy
            </a>
            <a href="#" className="block hover:text-cream">
              Terms of Use
            </a>
            <a href="#" className="block hover:text-cream">
              Responsible Lending
            </a>
            <a href="mailto:hello@buckme.example" className="block hover:text-cream">
              Contact us
            </a>
          </nav>
        </div>

        <p className="mt-12 text-xs text-cream/40">
          © {new Date().getFullYear()} Buck Me. All rights reserved. This is a
          demonstration site.
        </p>
      </div>
    </footer>
  );
}
