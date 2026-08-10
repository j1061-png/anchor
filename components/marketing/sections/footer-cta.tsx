"use client";

import Link from "next/link";
import { MarketingLogo } from "../logo";

export function FooterCta() {
  return (
    <footer className="mkt-footer-cta">
      <div className="mkt-section__inner">
        <div className="mkt-logo-panel mkt-logo-panel--center">
          <MarketingLogo size="lg" />
        </div>
        <h2 className="mkt-headline" style={{ marginTop: "2rem" }}>
          Five puzzles. Thinking stays yours.
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginTop: "1.75rem" }}>
          <Link href="/auth?mode=signup" className="mkt-btn mkt-btn--focus">
            Start training
          </Link>
          <Link href="/research" className="mkt-btn mkt-btn--ghost">
            Research deck
          </Link>
          <a href="#bastani" className="mkt-btn mkt-btn--ghost">
            Bastani RCT
          </a>
        </div>
        <p className="mkt-body" style={{ marginTop: "2.5rem", fontSize: "0.75rem" }}>
          <Link href="/about" style={{ color: "var(--mkt-muted)", marginRight: "1rem" }}>
            About
          </Link>
          <Link href="/privacy" style={{ color: "var(--mkt-muted)", marginRight: "1rem" }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ color: "var(--mkt-muted)", marginRight: "1rem" }}>
            Terms
          </Link>
          <Link href="/support" style={{ color: "var(--mkt-muted)" }}>
            Support
          </Link>
        </p>
      </div>
    </footer>
  );
}
