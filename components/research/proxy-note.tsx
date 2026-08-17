import type { ReactNode } from "react";
import { PROXY_DISCLAIMER } from "@/lib/research/types";

// M5 / F4 / G4. Every figure Anchor shows about a student is a count of things
// they did inside this app. It is not a test score, and the app must say so
// next to the number rather than in a footnote nobody reads.
//
// The disclaimer string itself lives in lib/research/types.ts and is rendered
// verbatim. Extra sentences go in `children` so the shared wording never drifts.

export interface ProxyNoteProps {
  /** `block` gets its own surface, for a whole section. `inline` sits under a number. */
  variant?: "inline" | "block";
  /** One extra sentence about this particular metric. Optional. */
  children?: ReactNode;
  className?: string;
}

export function ProxyNote({
  variant = "inline",
  children,
  className = "",
}: ProxyNoteProps) {
  const text = (
    <>
      {PROXY_DISCLAIMER}
      {children ? <> {children}</> : null}
    </>
  );

  if (variant === "block") {
    return (
      <p
        className={`well p-3.5 text-xs leading-relaxed text-text-2 ${className}`}
      >
        <span className="font-semibold text-text">How to read this. </span>
        {text}
      </p>
    );
  }

  return (
    <p className={`text-xs leading-relaxed text-text-3 ${className}`}>{text}</p>
  );
}
