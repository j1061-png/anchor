"use client";

import { useId, useState } from "react";
import { WHY, type WhyKey } from "@/lib/why";
import { Icon } from "./icon";

/**
 * The "why am I being made to do this?" disclosure.
 *
 * Collapsed it is one quiet line; expanded it gives the mechanism and the
 * citation. Used beside any mechanic that would otherwise read as arbitrary
 * gamification.
 */
export function WhyThis({
  k,
  className = "",
  defaultOpen = false,
}: {
  k: WhyKey;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const why = WHY[k];

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="group inline-flex cursor-pointer items-center gap-1.5 text-left text-xs font-medium text-text-3 transition-colors hover:text-text-2"
      >
        <Icon name="info" size={14} className="opacity-70" />
        <span className="underline decoration-dotted underline-offset-4">
          {why.short}
        </span>
        <Icon
          name="chevronDown"
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={id}
          className="fade-in mt-2.5 rounded-[var(--r-md)] border border-[var(--line)] bg-raised p-3.5"
        >
          <p className="text-[0.8125rem] leading-relaxed text-text-2">
            {why.body}
          </p>
          <p className="mt-2 text-[0.6875rem] font-medium text-text-3">
            {why.source}
          </p>
        </div>
      )}
    </div>
  );
}

/** Always-open variant for pages that lead with the reasoning. */
export function WhyNote({
  k,
  className = "",
}: {
  k: WhyKey;
  className?: string;
}) {
  const why = WHY[k];
  return (
    <div
      className={`rounded-[var(--r-md)] border border-[var(--line)] bg-raised p-4 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon
          name="info"
          size={16}
          className="mt-0.5 shrink-0 text-text-3"
        />
        <div>
          <p className="text-sm font-semibold">{why.short}</p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-text-2">
            {why.body}
          </p>
          <p className="mt-2 text-[0.6875rem] font-medium text-text-3">
            {why.source}
          </p>
        </div>
      </div>
    </div>
  );
}
