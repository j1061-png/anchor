"use client";

import { useState } from "react";
import { getSource } from "@/lib/marketing/research-corpus";
import { GlassCard, RevealSection, WeaknessPanel } from "../primitives";

export function BastaniRctSection() {
  const [phase, setPhase] = useState<"with-ai" | "exam">("with-ai");
  const source = getSource("bastani-2025");

  return (
    <RevealSection id="bastani">
      <p className="mkt-eyebrow mkt-eyebrow--glow">Flagship RCT</p>
      <h2 className="mkt-headline mkt-headline--wide">
        The work looks better. The learner gets worse.
      </h2>
      <p className="mkt-lead">
        ~1,000 Turkish high-school maths students randomised to unguarded GPT-4, a
        guardrailed tutor, or no AI. Toggle the exam phase — this is the Bastani et
        al. (2025) result that Anchor is built on.
      </p>

      <div className="mkt-rct">
        <div className="mkt-rct__controls" role="tablist" aria-label="RCT phase">
          <button
            type="button"
            role="tab"
            aria-selected={phase === "with-ai"}
            className={`mkt-rct__tab ${phase === "with-ai" ? "mkt-rct__tab--active" : ""}`}
            onClick={() => setPhase("with-ai")}
          >
            While using AI
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={phase === "exam"}
            className={`mkt-rct__tab ${phase === "exam" ? "mkt-rct__tab--active" : ""}`}
            onClick={() => setPhase("exam")}
          >
            Later exam — AI removed
          </button>
        </div>

        <GlassCard accent={phase === "with-ai" ? "purple" : "coral"} className="mkt-rct__chart">
          <div className="mkt-bar-chart">
            <div className="mkt-bar-chart__col">
              <div
                className={`mkt-bar mkt-bar--purple ${phase === "with-ai" ? "mkt-bar--up" : "mkt-bar--dim"}`}
                style={{ height: phase === "with-ai" ? "78%" : "42%" }}
              >
                <span className="mkt-bar__label">+48%</span>
              </div>
              <span className="mkt-bar-chart__caption">Practice with unguarded GPT-4</span>
            </div>
            <div className="mkt-bar-chart__col">
              <div
                className={`mkt-bar mkt-bar--coral ${phase === "exam" ? "mkt-bar--down" : "mkt-bar--dim"}`}
                style={{ height: phase === "exam" ? "28%" : "8%" }}
              >
                <span className="mkt-bar__label">−17%</span>
              </div>
              <span className="mkt-bar-chart__caption">Exam without AI</span>
            </div>
            <div className="mkt-bar-chart__col">
              <div className="mkt-bar mkt-bar--teal mkt-bar--dim" style={{ height: "50%" }}>
                <span className="mkt-bar__label">Baseline</span>
              </div>
              <span className="mkt-bar-chart__caption">Never had AI</span>
            </div>
          </div>
        </GlassCard>

        <p className="mkt-rct__copy">
          {phase === "with-ai"
            ? "Students with unguarded GPT-4 scored 48% higher while the tool was present — performance with the tool is not performance without it."
            : "Same students scored 17% below those who never had AI — and reported no sense that their learning had suffered. That is the assisted–unaided gap."}
        </p>
      </div>

      <WeaknessPanel>{source.caveat}</WeaknessPanel>
    </RevealSection>
  );
}
