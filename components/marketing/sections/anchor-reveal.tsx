"use client";

import { useCallback, useRef, useState } from "react";
import { Section, Eyebrow, Headline, Lead } from "../ui";

export function AnchorRevealSection() {
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const onMove = useCallback((clientX: number, rect: DOMRect) => {
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPct(Math.round((x / rect.width) * 100));
  }, []);

  return (
    <Section id="anchor" className="mkt-section--paper">
      <Eyebrow>Introducing Anchor</Eyebrow>
      <Headline>That&apos;s where Anchor comes in.</Headline>
      <Lead>
        Intentional boundaries between you and the tools that compete for your
        attention — so thinking stays human when it needs to.
      </Lead>

      <div
        className="mkt-compare"
        onPointerDown={(e) => {
          dragging.current = true;
          onMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          onMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
        }}
      >
        <div className="mkt-compare__pane mkt-compare__before">
          <p className="mkt-eyebrow" style={{ color: "var(--mkt-accent)" }}>
            Before
          </p>
          <ul style={{ marginTop: "1rem", fontSize: "0.9375rem", lineHeight: 1.7, color: "var(--mkt-navy)" }}>
            <li>Constant interruptions</li>
            <li>Fragmented attention</li>
            <li>Reactive behaviour</li>
            <li>Answers on demand</li>
          </ul>
        </div>
        <div
          className="mkt-compare__after"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          <p className="mkt-eyebrow" style={{ color: "var(--mkt-blue)" }}>
            After
          </p>
          <ul style={{ marginTop: "1rem", fontSize: "0.9375rem", lineHeight: 1.7 }}>
            <li>Intentional access</li>
            <li>Protected focus</li>
            <li>Attempt before help</li>
            <li>Scheduled brain-only work</li>
          </ul>
        </div>
        <div className="mkt-compare__handle" style={{ left: `${pct}%` }} aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          className="mkt-compare__range"
          aria-label="Before and after comparison"
          onChange={(e) => setPct(Number(e.target.value))}
        />
      </div>
      <p className="mkt-body" style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#6b7280" }}>
        Drag the slider. Anchor is built on the intervention record: change the
        payoff for unaided work, not the lecture (Sachdeva &amp; Gilbert, 2020).
      </p>
    </Section>
  );
}
