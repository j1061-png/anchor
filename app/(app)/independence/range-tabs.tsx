"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WINDOWS, parseWindow } from "./window";

// The window lives in the URL so the server fetches for it; this bar only
// reflects it. Styled to match <SegmentedNav>, which cannot be reused directly
// because that one keys off the pathname rather than a query parameter.
export function RangeTabs() {
  const active = parseWindow(useSearchParams().get("days"));

  return (
    <nav
      aria-label="Window"
      className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <div className="inline-flex gap-1 rounded-[var(--r-md)] border border-[var(--line)] bg-surface p-1 shadow-[var(--shadow-xs)]">
        {WINDOWS.map((days) => {
          const current = days === active;
          return (
            <Link
              key={days}
              href={`/independence?days=${days}`}
              scroll={false}
              aria-current={current ? "page" : undefined}
              className={`inline-flex min-h-9 items-center justify-center gap-1 whitespace-nowrap rounded-[var(--r-sm)] px-4 text-[0.8125rem] font-semibold transition-all duration-[130ms] ${
                current
                  ? "bg-text text-canvas shadow-[var(--shadow-xs)]"
                  : "text-text-2 hover:bg-raised hover:text-text"
              }`}
            >
              <span className="num">{days}</span> days
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
