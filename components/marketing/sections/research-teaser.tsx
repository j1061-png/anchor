"use client";

import Link from "next/link";
import { Section, Eyebrow, Headline, Lead } from "../ui";

export function ResearchTeaserSection() {
  return (
    <Section id="research-teaser" dark>
      <Eyebrow>The full review</Eyebrow>
      <Headline className="mkt-headline--wide">
        Cognitive offloading, as an interactive deck
      </Headline>
      <Lead>
        22 sources. 9 peer-reviewed studies. Slide-by-slide charts, caveats,
        thought process, and the companion paper — the same experience Malek
        Zahran and Abdallah El Dessouky built for the research presentation.
      </Lead>
      <div className="mkt-hero__actions" style={{ marginTop: "1.75rem" }}>
        <Link href="/research" className="mkt-btn mkt-btn--focus">
          Open the research deck
        </Link>
        <Link href="/about" className="mkt-btn mkt-btn--ghost">
          About Anchor
        </Link>
      </div>
      <ul className="mkt-deck-features">
        <li>Keyboard and touch navigation</li>
        <li>Interactive charts on every claim</li>
        <li>&ldquo;Where this is weak&rdquo; on every slide</li>
        <li>Research paper and thought-process panels</li>
      </ul>
    </Section>
  );
}
