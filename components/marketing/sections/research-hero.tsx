"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "../primitives";

const CHAIN = [
  {
    id: "lists",
    era: "Always",
    tool: "Lists & notes",
    detail: "Offload storage. You still frame the task.",
    cite: "Risko & Gilbert, 2016",
  },
  {
    id: "calc",
    era: "1970s+",
    tool: "Calculator",
    detail: "Offload arithmetic. You still interpret the number.",
    cite: "Sweller, cognitive load theory",
  },
  {
    id: "search",
    era: "2000s+",
    tool: "Search & GPS",
    detail: "Remember where to find it, not what it was — the Google effect.",
    cite: "Sparrow et al., Science (2011)",
  },
  {
    id: "genai",
    era: "Now",
    tool: "Generative AI",
    detail: "Offload framing, reasoning, judgement, and production — in one step.",
    cite: "Skulmowski (2023); Liu et al. (2026)",
  },
] as const;

export function ResearchHeroSection() {
  const [step, setStep] = useState(3);
  const [auto, setAuto] = useState(true);
  const active = CHAIN[step];

  const advance = useCallback(() => {
    setStep((s) => (s + 1) % CHAIN.length);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(advance, 3200);
    return () => window.clearInterval(id);
  }, [auto, advance]);

  return (
    <header className="mkt-research-hero">
      <div className="mkt-research-hero__bg" aria-hidden />
      <div className="mkt-section__inner mkt-research-hero__inner">
        <p className="mkt-eyebrow mkt-eyebrow--glow">Cognitive offloading &amp; AI</p>
        <h1 className="mkt-headline mkt-headline--hero">
          Your brain on autopilot
        </h1>
        <p className="mkt-lead mkt-lead--hero">
          Generative AI is not the first tool that moves thinking outside your head.
          It is the first that can offload the whole chain — framing, reasoning,
          judgement, and production — in one tap. This site is the research, not a
          productivity pitch.
        </p>

        <div className="mkt-chain" role="tablist" aria-label="Offloading evolution">
          {CHAIN.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={step === i}
              className={`mkt-chain__node ${step === i ? "mkt-chain__node--active" : ""} ${step > i ? "mkt-chain__node--past" : ""}`}
              onClick={() => {
                setAuto(false);
                setStep(i);
              }}
            >
              <span className="mkt-chain__era">{item.era}</span>
              <span className="mkt-chain__tool">{item.tool}</span>
            </button>
          ))}
        </div>

        <GlassCard accent={step === 3 ? "coral" : step === 2 ? "teal" : "purple"} className="mkt-chain__detail">
          <p className="mkt-chain__detail-tool">{active.tool}</p>
          <p className="mkt-chain__detail-body">{active.detail}</p>
          <p className="mkt-chain__detail-cite">{active.cite}</p>
          <div className="mkt-hero__actions" style={{ marginTop: "1.25rem" }}>
            <button
              type="button"
              className="mkt-btn mkt-btn--ghost"
              onClick={() => {
                setAuto(false);
                advance();
              }}
            >
              Next in chain →
            </button>
            <Link href="#adoption" className="mkt-btn mkt-btn--focus">
              See the AI adoption data
            </Link>
            <Link href="#deck" className="mkt-btn mkt-btn--ghost">
              Open full research deck
            </Link>
          </div>
        </GlassCard>
      </div>
    </header>
  );
}
