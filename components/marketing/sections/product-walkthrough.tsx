"use client";

import { useState } from "react";
import { RevealSection } from "../primitives";

const STEPS = [
  {
    title: "Choose a focus period",
    body: "Pick when you need protected time — a daily session, a brain-only block, or a tutor window with rules.",
  },
  {
    title: "Submit an attempt first",
    body: "No hint until you have tried. Productive failure before instruction (Kapur, 2008; Sinha & Kapur, 2021).",
  },
  {
    title: "Hints withhold the answer",
    body: "The tutor releases one step at a time, grounded in a verified key. Guardrails get gamed if they only delay answers (Baker et al., 2004).",
  },
  {
    title: "Brain-only mode activates",
    body: "Scheduled sessions with no AI by design — aviation calls this hand-flying; medicine is proposing the same (FAA, 2013; Budzyń et al., 2025).",
  },
  {
    title: "Support fades as you improve",
    body: "Sustained unaided success drops hint intensity. Regressions bring support back — reversible, visible, earned.",
  },
  {
    title: "You finish. Access returns.",
    body: "Independence is measured: attempts before help, hint reliance, unaided accuracy. Not a single vanity score.",
  },
] as const;

export function ProductWalkthroughSection() {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;

  return (
    <RevealSection id="how-it-works">
      <p className="mkt-eyebrow mkt-eyebrow--glow">The product</p>
      <h2 className="mkt-headline">How Anchor responds to the research</h2>
      <p className="mkt-lead">
        Click through. Each step maps to an intervention in the review — attempt-first,
        guardrailed tutor, brain-only sessions.
      </p>

      <div className="mkt-steps" role="tablist" aria-label="Walkthrough steps">
        {STEPS.map((_, i) => (
          <button
            key={STEPS[i].title}
            type="button"
            role="tab"
            aria-selected={step === i}
            aria-label={`Step ${i + 1}`}
            className={`mkt-step-dot ${step === i ? "mkt-step-dot--active" : ""}`}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      <div className="mkt-walk-card" role="tabpanel">
        <p className="mkt-eyebrow">
          Step <span className="mkt-num">{step + 1}</span> /{" "}
          <span className="mkt-num">{STEPS.length}</span>
        </p>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mkt-btn mkt-btn--ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="mkt-btn mkt-btn--primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </button>
          ) : (
            <a href="/auth?mode=signup" className="mkt-btn mkt-btn--focus">
              Start training
            </a>
          )}
        </div>
      </div>
    </RevealSection>
  );
}
