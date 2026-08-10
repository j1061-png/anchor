"use client";

import { useState } from "react";
import { getSource } from "@/lib/marketing/research-corpus";
import { CountUpStat, GlassCard, RevealSection, WeaknessPanel } from "../primitives";

const STATS = [
  {
    id: "csm-use",
    value: 86,
    suffix: "%",
    label: "U.S. children 9–17 now use AI",
    sub: "Common Sense Media, 2026 · n=1,204",
    sourceId: "csm-2026",
    accent: "purple" as const,
  },
  {
    id: "csm-school",
    value: 85,
    suffix: "%",
    label: "Apply AI to schoolwork",
    sub: "48% weekly · 21% every day",
    sourceId: "csm-2026",
    accent: "teal" as const,
  },
  {
    id: "hepi",
    value: 94,
    suffix: "%",
    label: "UK undergraduates use AI for assessed work",
    sub: "Up from 53% in 2024 · HEPI, 2026",
    sourceId: "hepi-2026",
    accent: "coral" as const,
  },
];

export function AdoptionStatsSection() {
  const [active, setActive] = useState<string>("csm-use");
  const stat = STATS.find((s) => s.id === active)!;
  const source = getSource(stat.sourceId);

  return (
    <RevealSection id="adoption">
      <p className="mkt-eyebrow mkt-eyebrow--glow">Adoption</p>
      <h2 className="mkt-headline mkt-headline--wide">
        It is already everywhere — instruction has not caught up
      </h2>
      <p className="mkt-lead">
        Tap each stat. Every number comes from the cognitive-offloading review.
        Adoption ran ahead of teaching students to use AI safely or to think without it.
      </p>

      <div className="mkt-stat-grid">
        {STATS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`mkt-stat-card ${active === s.id ? "mkt-stat-card--active" : ""}`}
            onClick={() => setActive(s.id)}
            aria-pressed={active === s.id}
          >
            <CountUpStat
              value={s.value}
              suffix={s.suffix}
              label={s.label}
              sub={s.sub}
              active
              accent={s.accent}
            />
          </button>
        ))}
      </div>

      <GlassCard accent="amber" className="mkt-stat-explainer">
        <p className="mkt-stat-explainer__authors">
          {source.authors} ({source.year > 0 ? source.year : source.publication})
        </p>
        <p className="mkt-stat-explainer__detail">{source.detail}</p>
        <p className="mkt-stat-explainer__rel">
          <strong>Why it matters:</strong> {source.relevance}
        </p>
      </GlassCard>

      {source.caveat ? (
        <WeaknessPanel>{source.caveat}</WeaknessPanel>
      ) : null}

      <p className="mkt-body mkt-body--muted" style={{ marginTop: "1.5rem" }}>
        Three-quarters of children say their school discussed AI rules; just over half
        were taught to use it safely. About half of parents do not realise their teen
        uses chatbots at all — same review, supervision gap slide.
      </p>
    </RevealSection>
  );
}
