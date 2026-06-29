"use client";

const ITEMS = [
  "Rates from 6.17% p.a.",
  "$5,000–$75,000",
  "1–7 year terms",
  "No monthly or early-repayment fees",
];

export function Marquee() {
  // Two identical halves scroll left; -50% loop makes it seamless.
  const half = (
    <ul className="flex shrink-0 items-center" aria-hidden="true">
      {ITEMS.concat(ITEMS).map((item, i) => (
        <li key={i} className="flex items-center">
          <span className="display whitespace-nowrap px-6 text-2xl sm:text-3xl">
            {item}
          </span>
          <span className="text-magenta" aria-hidden="true">
            ●
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee-pause overflow-hidden bg-ink py-5 text-cream">
      <div className="flex w-max animate-marquee">
        {half}
        {half}
      </div>
    </div>
  );
}
