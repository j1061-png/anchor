"use client";

import Link from "next/link";
import { DECK_URL, SOURCES } from "@/lib/marketing/research-corpus";
import { RevealSection } from "../primitives";

export function SourcesSection() {
  return (
    <RevealSection id="sources">
      <p className="mkt-eyebrow mkt-eyebrow--glow">Bibliography</p>
      <h2 className="mkt-headline mkt-headline--wide">All 22 sources — expand any entry</h2>
      <p className="mkt-lead">
        Every number on this site comes from the cognitive-offloading review by Malek
        Zahran &amp; Abdallah El Dessouky — not from marketing copy.
      </p>

      <p className="mkt-body" style={{ marginTop: "1.25rem" }}>
        <Link href={DECK_URL} className="mkt-inline-link">
          Full research deck (9 peer-reviewed studies, intervention scorecard)
        </Link>
      </p>

      <div className="mkt-sources-list">
        {SOURCES.map((s) => (
          <details key={s.id} className="mkt-source">
            <summary>
              <span>
                {s.authors} ({s.year > 0 ? s.year : s.publication})
              </span>
              <span className="mkt-source__topic">{s.topic}</span>
            </summary>
            <div className="mkt-source__body">
              <p>{s.detail}</p>
              <p>
                <strong>Relevance to Anchor:</strong> {s.relevance}
              </p>
              {s.publication && s.year > 0 ? <p>{s.publication}</p> : null}
              {s.caveat ? <p className="mkt-caveat">{s.caveat}</p> : null}
            </div>
          </details>
        ))}
      </div>
    </RevealSection>
  );
}
