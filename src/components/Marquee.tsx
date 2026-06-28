"use client";

const ITEMS = [
  "Approved in minutes",
  "$300–$2,000",
  "No paper, no phone tag",
  "Pay it back your way",
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
