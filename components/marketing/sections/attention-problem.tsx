"use client";

import { useState } from "react";
import { SOURCES } from "@/lib/marketing/research-corpus";
import { Section, Eyebrow, Headline, Lead, PhoneFrame } from "../ui";

function src(id: string) {
  return SOURCES.find((s) => s.id === id)!;
}

const HOTSPOTS = [
  {
    id: "nearby",
    label: "Proximity",
    title: "The phone does not need to be in your hand",
    detail:
      "Cognitive offloading begins when you expect an external store to hold what you would otherwise encode. The device on the desk is already a promise that you do not have to hold the whole task in working memory.",
    cite: `${src("sparrow-2011").authors}, ${src("sparrow-2011").year}`,
  },
  {
    id: "switch",
    label: "Context switching",
    title: "Each interruption breaks continuity",
    detail:
      "Extraneous load is effort wasted on noise. Germane load is effort that builds understanding. Tools, especially ones that return finished thoughts, cannot reliably tell the two apart.",
    cite: "Sweller, cognitive load theory",
  },
  {
    id: "fragment",
    label: "Fragmentation",
    title: "Performance with the tool is not performance without it",
    detail:
      "Students practising with unguarded GPT-4 scored +48% while the tool was present and −17% on a later exam after it was removed, reporting no sense that learning had suffered.",
    cite: `${src("bastani-2025").authors}, ${src("bastani-2025").publication}`,
  },
  {
    id: "supervision",
    label: "Supervision gap",
    title: "Adoption ran ahead of instruction",
    detail:
      "Three-quarters of children say their school discussed AI rules; just over half were taught to use it safely. About half of parents do not realise their teen uses chatbots.",
    cite: `${src("csm-2026").authors}, ${src("csm-2026").year}. ${src("csm-2026").caveat ?? ""}`,
  },
] as const;

export function AttentionProblemSection() {
  const [active, setActive] = useState<string>("nearby");

  return (
    <Section id="attention-problem" className="mkt-section--paper">
      <Eyebrow>The attention problem</Eyebrow>
      <Headline className="mkt-headline--wide">
        Your phone does not need to be in your hand to interrupt you
      </Headline>
      <Lead>
        Tap each signal. Every claim below comes from the research review behind
        Anchor, not from a productivity blog.
      </Lead>

      <div className="mkt-attention-grid">
        <PhoneFrame label="Phone nearby visualization">
          <div className="mkt-phone__status">
            <span>Face down</span>
            <span>3 unread</span>
          </div>
          <div
            className="mkt-phone__content"
            style={{
              display: "grid",
              placeItems: "center",
              color: "var(--mkt-muted)",
              fontSize: "0.75rem",
              textAlign: "center",
              padding: "1.5rem",
            }}
          >
            <p>
              The screen is off.
              <br />
              Working memory is still split.
            </p>
            <div
              style={{
                position: "absolute",
                inset: "auto 1rem 1rem",
                display: "flex",
                gap: "0.35rem",
              }}
            >
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={active === "switch" ? "mkt-pulse-dot" : ""}
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    borderRadius: "999px",
                    background:
                      active === "nearby" || active === "fragment"
                        ? "var(--mkt-accent)"
                        : "rgb(255 255 255 / 0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        </PhoneFrame>

        <div className="mkt-hotspot-grid">
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`mkt-hotspot ${active === h.id ? "mkt-hotspot--active" : ""}`}
              onClick={() => setActive(h.id)}
              aria-expanded={active === h.id}
            >
              <span className="mkt-hotspot__label">{h.label}</span>
              <span className="mkt-hotspot__title">{h.title}</span>
              <span className="mkt-hotspot__detail">
                {h.detail}
                <span className="mkt-hotspot__cite">{h.cite}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
