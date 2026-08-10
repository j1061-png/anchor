"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeckStage } from "./deck-stage";
import { SourcesSection } from "./sections/sources";
import { ProductWalkthroughSection } from "./sections/product-walkthrough";
import { FooterCta } from "./sections/footer-cta";
import { MarketingSiteNav } from "./site-nav";

function IntroSplash({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className={`mkt-splash ${visible ? "mkt-splash--on" : ""}`}>
      <div className="mkt-splash__inner">
        <p className="mkt-eyebrow mkt-eyebrow--glow">Anchor × AI ethics research</p>
        <h1 className="mkt-splash__title">Cognitive offloading</h1>
        <p className="mkt-splash__sub">Your brain on autopilot</p>
        <p className="mkt-splash__body">
          22 sources · 9 peer-reviewed studies · interactive charts on every claim
        </p>
        <button type="button" className="mkt-btn mkt-btn--focus mkt-btn--lg" onClick={onDismiss}>
          Enter the deck →
        </button>
      </div>
    </div>
  );
}

export function MarketingExperience() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("anchor-deck-entered")) setSplash(false);
    } catch {
      setSplash(false);
    }
  }, []);

  const dismiss = () => {
    setSplash(false);
    try {
      sessionStorage.setItem("anchor-deck-entered", "1");
    } catch {
      /* ignore */
    }
    document.getElementById("deck")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mkt-root mkt-root--immersive">
      <div className="mkt-ambient-canvas" aria-hidden />
      <MarketingSiteNav />
      {splash ? <IntroSplash onDismiss={dismiss} /> : null}

      <header className="mkt-intro">
        <div className="mkt-section__inner">
          <p className="mkt-eyebrow mkt-eyebrow--glow">Generative AI &amp; the developing mind</p>
          <h1 className="mkt-headline mkt-headline--hero">
            The research deck <em>is</em> the site
          </h1>
          <p className="mkt-lead mkt-lead--hero">
            Not a PDF. Not a blog post. The full interactive presentation — adoption
            stats, Bastani RCT, doctor deskilling, design countermeasures — embedded
            and synced with Anchor&apos;s navigation.
          </p>
          <div className="mkt-intro__actions">
            <button
              type="button"
              className="mkt-btn mkt-btn--focus"
              onClick={() => document.getElementById("deck")?.scrollIntoView({ behavior: "smooth" })}
            >
              Jump into research
            </button>
            <Link href="/auth?mode=signup" className="mkt-btn mkt-btn--ghost">
              Start training
            </Link>
          </div>
        </div>
        <div className="mkt-intro__scroll" aria-hidden>
          <span />
        </div>
      </header>

      <DeckStage />

      <div className="mkt-after-deck">
        <ProductWalkthroughSection />
        <SourcesSection />
        <FooterCta />
      </div>
    </div>
  );
}
