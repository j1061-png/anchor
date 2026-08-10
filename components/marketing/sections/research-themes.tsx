"use client";

import { useMemo, useState } from "react";
import { RESEARCH_THEMES, SOURCES } from "@/lib/marketing/research-corpus";
import { Section, Eyebrow, Headline, Lead } from "../ui";

function ThemeVisualization({ themeId }: { themeId: string }) {
  const [offloadChoice, setOffloadChoice] = useState<"self" | "phone" | null>(null);
  const [memoryPhase, setMemoryPhase] = useState<"show" | "hide" | "done">("show");
  const [memoryGuess, setMemoryGuess] = useState("");
  const sequence = useMemo(() => [7, 3, 9, 1], []);

  if (themeId === "attention") {
    return (
      <div className="mkt-theme-viz" aria-label="Task interrupted by breaks">
        <p className="mkt-body" style={{ color: "var(--mkt-navy)", marginBottom: "0.75rem" }}>
          Continuous work on a single task
        </p>
        <div className="mkt-timeline">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <span
              key={n}
              className={`mkt-timeline__seg ${n === 3 || n === 6 ? "mkt-timeline__seg--break" : ""}`}
              title={n === 3 || n === 6 ? "Interruption" : "On task"}
            />
          ))}
        </div>
        <p className="mkt-body" style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.65rem" }}>
          Red segments: attention pulled off-task. Recovery is rarely instant.
        </p>
      </div>
    );
  }

  if (themeId === "offloading") {
    return (
      <div className="mkt-theme-viz">
        <p className="mkt-body" style={{ color: "var(--mkt-navy)", marginBottom: "0.75rem" }}>
          Where is this stored?
        </p>
        <div className="mkt-offload-choice">
          <button
            type="button"
            className={`mkt-offload-btn ${offloadChoice === "self" ? "mkt-offload-btn--picked" : ""}`}
            onClick={() => setOffloadChoice("self")}
          >
            Remember it yourself
          </button>
          <button
            type="button"
            className={`mkt-offload-btn ${offloadChoice === "phone" ? "mkt-offload-btn--picked" : ""}`}
            onClick={() => setOffloadChoice("phone")}
          >
            Ask your phone / AI
          </button>
        </div>
        {offloadChoice === "self" && (
          <p className="mkt-body" style={{ marginTop: "0.85rem", color: "#4a5568" }}>
            You encode the fact and the route to it. Retrieval practice strengthens
            the trace (Adesope et al., 2017, g≈0.61).
          </p>
        )}
        {offloadChoice === "phone" && (
          <p className="mkt-body" style={{ marginTop: "0.85rem", color: "#4a5568" }}>
            You may remember where to find it more than the thing itself — the
            Google effect (Sparrow et al., 2011). With generative AI, the whole
            chain can move outside your head.
          </p>
        )}
      </div>
    );
  }

  if (themeId === "memory") {
    const correct = memoryGuess.trim() === sequence.join("");
    return (
      <div className="mkt-theme-viz">
        {memoryPhase === "show" && (
          <>
            <p className="mkt-body" style={{ color: "var(--mkt-navy)", marginBottom: "0.75rem" }}>
              Memorise this sequence. You have 4 seconds.
            </p>
            <div className="mkt-memory-grid">
              {sequence.map((n) => (
                <div key={n} className="mkt-memory-cell">
                  {n}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mkt-btn mkt-btn--ghost"
              style={{ marginTop: "1rem", color: "var(--mkt-navy)", borderColor: "var(--mkt-line-dark)" }}
              onClick={() => {
                setMemoryPhase("hide");
                window.setTimeout(() => setMemoryPhase("done"), 4000);
              }}
            >
              Hide &amp; recall
            </button>
          </>
        )}
        {memoryPhase === "hide" && (
          <p className="mkt-body" style={{ color: "var(--mkt-navy)" }}>
            Recall the four digits…
          </p>
        )}
        {memoryPhase === "done" && (
          <>
            <label className="mkt-body" style={{ color: "var(--mkt-navy)", display: "block" }}>
              Type the sequence (no spaces)
              <input
                className="mkt-num"
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  width: "100%",
                  maxWidth: "12rem",
                  padding: "0.5rem 0.65rem",
                  border: "1px solid var(--mkt-line-dark)",
                  borderRadius: "0.35rem",
                }}
                value={memoryGuess}
                onChange={(e) => setMemoryGuess(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
              />
            </label>
            {memoryGuess.length === 4 && (
              <p className="mkt-body" style={{ marginTop: "0.75rem", color: "#4a5568" }}>
                {correct
                  ? "You held it in working memory. Expect to look it up later and encoding shifts — Sparrow et al., 2011."
                  : "Most people drop digits under split attention. That is why offloading has a memory cost."}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  if (themeId === "design") {
    return (
      <div className="mkt-theme-viz">
        <div style={{ display: "grid", gap: "0.65rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
            <span>Student alone with AI</span>
            <span className="mkt-num">0.077</span>
          </div>
          <div
            style={{
              height: "0.45rem",
              background: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div style={{ width: "6%", height: "100%", background: "var(--mkt-accent)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "0.5rem" }}>
            <span>Teacher in the loop</span>
            <span className="mkt-num">1.426</span>
          </div>
          <div
            style={{
              height: "0.45rem",
              background: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div style={{ width: "100%", height: "100%", background: "var(--mkt-blue)" }} />
          </div>
        </div>
        <p className="mkt-body" style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
          Gu &amp; Yan (2025), meta-analysis of 19 studies. Between-study comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="mkt-theme-viz">
      <p className="mkt-body" style={{ color: "#4a5568" }}>
        Explore the citations below for this theme. Anchor does not invent numbers
        where the review does not provide them.
      </p>
    </div>
  );
}

export function ResearchThemesSection() {
  type ThemeId = (typeof RESEARCH_THEMES)[number]["id"];
  const [active, setActive] = useState<ThemeId>(RESEARCH_THEMES[0].id);
  const theme = RESEARCH_THEMES.find((t) => t.id === active)!;
  const refs = theme.sourceIds.map((id) => SOURCES.find((s) => s.id === id)!);

  return (
    <Section id="research" className="mkt-section--paper">
      <Eyebrow>Why Anchor exists</Eyebrow>
      <Headline className="mkt-headline--wide">
        The research behind the problem
      </Headline>
      <Lead>
        Not a wall of cards — seven themes from the cognitive-offloading review.
        Each one is interactive. Each claim traces to a named study.
      </Lead>

      <div className="mkt-theme-tabs" role="tablist" aria-label="Research themes">
        {RESEARCH_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={`mkt-theme-tab ${active === t.id ? "mkt-theme-tab--active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mkt-theme-panel" role="tabpanel">
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.35rem",
            color: "var(--mkt-navy)",
          }}
        >
          {theme.hook}
        </h3>
        <p className="mkt-body" style={{ marginTop: "0.65rem", color: "#4a5568" }}>
          {theme.body}
        </p>
        {"caveat" in theme && theme.caveat ? (
          <p className="mkt-caveat">{theme.caveat}</p>
        ) : null}
        <ThemeVisualization themeId={theme.id} />
        <ul style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#6b7280" }}>
          {refs.map((r) => (
            <li key={r.id} style={{ marginTop: "0.35rem" }}>
              <strong style={{ color: "var(--mkt-navy)" }}>
                {r.authors} ({r.year > 0 ? r.year : r.publication})
              </strong>
              {" — "}
              {r.detail}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
