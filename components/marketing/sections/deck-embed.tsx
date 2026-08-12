"use client";

import Link from "next/link";
import { RevealSection } from "../primitives";

export function DeckEmbedSection() {
  return (
    <RevealSection id="deck" className="mkt-section--deck-full">
      <p className="mkt-eyebrow mkt-eyebrow--glow">Full research experience</p>
      <h2 className="mkt-headline mkt-headline--wide">
        Cognitive offloading — interactive deck
      </h2>
      <p className="mkt-lead">
        22 sources. 9 peer-reviewed studies. Slide-by-slide charts, caveats on every
        claim, intervention scorecard, and thought-process panels — the same deck Malek
        Zahran and Abdallah El Dessouky built for the research presentation.
      </p>

      <div className="mkt-deck-frame-wrap">
        <iframe
          title="Cognitive Offloading research deck"
          src="/research/Cognitive_Offloading_Deck.html"
          className="mkt-deck-frame"
          loading="lazy"
        />
        <div className="mkt-deck-frame__overlay">
          <Link href="/research" className="mkt-btn mkt-btn--focus mkt-btn--lg">
            Launch fullscreen deck →
          </Link>
          <p className="mkt-body mkt-body--muted">
            Keyboard: ← → navigate · Esc grid · Touch swipe
          </p>
        </div>
      </div>
    </RevealSection>
  );
}
