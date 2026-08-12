"use client";

import { Section } from "../ui";

export function ManifestoSection() {
  return (
    <Section id="philosophy" dark>
      <div
        className="mkt-manifesto__inner"
        style={{ textAlign: "center", paddingBlock: "clamp(6rem, 18vh, 12rem)" }}
      >
        <p className="mkt-eyebrow">Philosophy</p>
        <h2 className="mkt-headline mkt-headline--manifesto" style={{ marginInline: "auto" }}>
          Technology should be available when you choose it
        </h2>
        <p
          className="mkt-headline mkt-headline--manifesto mkt-manifesto__accent"
          style={{ marginInline: "auto", marginTop: "0.35rem" }}
        >
          not because it chooses you.
        </p>
        <p
          className="mkt-lead"
          style={{ marginInline: "auto", marginTop: "2rem", maxWidth: "32rem" }}
        >
          Use AI when it helps you think. Don&apos;t use AI instead of thinking.
          Scaffold, don&apos;t substitute.
        </p>
      </div>
    </Section>
  );
}
