"use client";

import { DECK_URL, SOURCES } from "@/lib/marketing/research-corpus";
import { Section, Eyebrow, Headline, Lead } from "../ui";

export function SourcesSection() {
  return (
    <Section id="sources" className="mkt-section--paper">
      <Eyebrow>Research sources</Eyebrow>
      <Headline className="mkt-headline--wide">Every claim, named</Headline>
      <Lead>
        Expand any entry. Numbers on this site come from the cognitive-offloading
        review by Malek Zahran &amp; Abdallah El Dessouky — not from marketing
        copy.
      </Lead>

      <p className="mkt-body" style={{ marginTop: "1.5rem" }}>
        <a
          href={DECK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--mkt-blue-dim)", fontWeight: 600, textDecoration: "underline" }}
        >
          Full research deck (22 sources, 9 peer-reviewed studies)
        </a>
      </p>

      <div style={{ marginTop: "2rem" }}>
        {SOURCES.map((s) => (
          <details key={s.id} className="mkt-source">
            <summary>
              <span>
                {s.authors} ({s.year > 0 ? s.year : s.publication})
              </span>
              <span style={{ color: "var(--mkt-blue-dim)", fontSize: "0.75rem" }}>{s.topic}</span>
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
    </Section>
  );
}
