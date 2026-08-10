"use client";

import type { ReactNode } from "react";

/** Lightweight entrance for marketing sections. Respects reduced motion via CSS. */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={`mkt-reveal ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
