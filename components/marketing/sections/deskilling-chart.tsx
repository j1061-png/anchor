"use client";

import { useState } from "react";
import { getSource } from "@/lib/marketing/research-corpus";
import { GlassCard, RevealSection, WeaknessPanel } from "../primitives";

export function DeskillingSection() {
  const [week, setWeek] = useState<0 | 12>(0);
  const source = getSource("budzyn-2025");
  const before = 28.4;
  const after = 22.4;

  return (
    <RevealSection id="deskilling">
      <p className="mkt-eyebrow mkt-eyebrow--glow">Real-world deskilling</p>
      <h2 className="mkt-headline mkt-headline--wide">
        It already happened — to doctors
      </h2>
      <p className="mkt-lead">
        After 12 weeks of AI-assisted colonoscopy (&gt;23,000 procedures), experienced
        endoscopists&apos; unaided polyp detection fell. Scrub the timeline — this is
        not a classroom simulation.
      </p>

      <div className="mkt-scrub">
        <label className="mkt-scrub__label" htmlFor="deskilling-week">
          Week {week} · unaided detection rate
        </label>
        <input
          id="deskilling-week"
          type="range"
          min={0}
          max={12}
          step={12}
          value={week}
          className="mkt-scrub__input"
          onChange={(e) => setWeek(Number(e.target.value) as 0 | 12)}
        />
        <div className="mkt-scrub__ticks">
          <span>Week 0</span>
          <span>Week 12</span>
        </div>
      </div>

      <GlassCard accent="coral" className="mkt-deskill-chart">
        <div className="mkt-deskill-num">
          <span className="mkt-num">{week === 0 ? before : after}%</span>
          {week === 12 ? (
            <span className="mkt-deskill-delta">−6.0 pts · p=0.0089</span>
          ) : null}
        </div>
        <div className="mkt-deskill-bar-wrap">
          <div
            className="mkt-deskill-bar"
            style={{ width: `${week === 0 ? before : after}%` }}
          />
        </div>
        <p className="mkt-body mkt-body--muted" style={{ marginTop: "1rem" }}>
          Budzyń et al., <em>The Lancet Gastroenterology &amp; Hepatology</em> (2025).
          Adults maintaining an existing skill — inference to adolescents still building
          skills requires caution.
        </p>
      </GlassCard>

      <WeaknessPanel>{source.caveat}</WeaknessPanel>
    </RevealSection>
  );
}
