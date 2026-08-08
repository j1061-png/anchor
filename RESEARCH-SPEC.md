# Anchor — research-backed product strategy, mapped to implementation

Source: `Anchor .pdf` (18 pages). This file is the authoritative checklist. Every
numbered requirement below traces to the document. Nothing here is invented.

Product philosophy (verbatim): **"Use AI when it helps you think. Don't use AI
instead of thinking." Scaffold, don't substitute.**

Core hypothesis the whole product exists to validate (verbatim):

> "For adolescent students, an AI learning tool that requires an independent
> attempt before offering graduated, answer-withholding hints — and that fades
> assistance as competence grows — will produce better unaided performance,
> delayed retention, and transfer, with greater persistence, than the same tool
> offering answers on demand, without sacrificing engagement."

---

## 0. What the document REJECTS (must be removed or rebuilt)

| # | Rejected | Currently in Anchor | Action |
|---|---|---|---|
| R1 | Single composite "Cognitive Independence / Brain Score" — "scientifically indefensible as one number" | `profiles.cognitive_score` 0–1000, shown as dashboard hero | Replace with transparent multi-dimensional profile (F) |
| R2 | Abstract far-transfer "brain-training" games sold as intelligence boosters | BlockFit / RuleShift / Recall / MentalMath framed as cognitive training | Keep as *practice items* only; never claim intelligence gains; add curriculum-embedded retrieval items (A) |
| R3 | Absolute-score global leaderboards | Global + weekly + school boards ranked by cognitive score | Replace with opt-in, skill-banded "Most Improved" / Independence boards (Stage 3) |
| R4 | Completion/usage-based XP and streaks | XP per puzzle completed; daily usage streak | Rebuild XP around independence behaviours; streaks only for retrieval attempts / AI-free runs |
| R5 | Model/session-switching marketed as a cognitive feature | not built | Build only as an A/B research probe, unmarketed |

Also required: **never advertise IQ or general-ability gains** (Feature A.14),
and label all in-app metrics as *behavioural proxies, not validated psychological
constructs* (Measurement Framework).

---

## 1. FEATURE B — Attempt-First engine  *(flagship, MVP, priority 1)*

Evidence: Sinha & Kapur 2021 (g≈0.36, up to 0.58 at high fidelity); Bastani et al.
2025; Buçinca et al. 2021; Liu et al. 2026. Strength: **STRONG**.

Required UX (verbatim 7): *"Problem appears → student must submit initial
reasoning/answer → Anchor evaluates → targeted hint → second attempt →
escalating hints → full solution only after sufficient effort/attempts."*

- B1. No hint is reachable until an initial attempt is submitted. This replaces
  the current 45-second timer as the gate. (Timer may remain as a *floor*, but
  the attempt is the gate.)
- B2. Attempt chain recorded: every attempt, in order, with timestamps.
- B3. AI diagnoses the attempt and selects the next hint level. Never gives the
  full solution on demand (8).
- B4. Full worked solution released only after sufficient effort/attempts (7, 9).
- B5. Measure: time-thinking-before-help; attempts before solution reveal; %
  solved without full solution; persistence (skip rate) (10).
- B6. Framing: "You cracked it with only 1 hint" — reward independence (11).
- B7. Safeguards: adaptive difficulty to keep struggle productive; detect
  low-effort/filler attempts; explicit "I'm stuck" escalation (13, 14).
- B8. Anti-hallucination: hints generated against a verified solution; if the
  model cannot ground a hint, defer to a generic strategy prompt (15).

## 2. FEATURE C — Hint-first AI Tutor  *(MVP, priority 1)*

Evidence: Bastani 2025; Kestin et al. *Scientific Reports* 15:17458 (2025),
N=194 crossover RCT; VanLehn ITS. Strength: **STRONG**.

- C1. Tutor asks what the student thinks *first* (7).
- C2. Offers one step at a time (7).
- C3. Names the misconception (7).
- C4. Asks the student to explain back (7).
- C5. Increases help only as needed, and fades as competence rises (7).
- C6. Constrained to ask/hint/diagnose — never hands over full solutions on
  demand (8).
- C7. Output: dialogue transcript, identified-misconception tag,
  self-explanation prompt (9).
- C8. Brevity constraints — Kestin fixed cognitive overload by forcing brevity (13, 14).
- C9. Grounded solutions; escalate when confidence low (14).
- C10. Measure: hint reliance; self-explanation quality; misconception
  resolution rate; unaided follow-up accuracy (10).

## 3. FEATURE I — Key-grounded feedback  *(MVP, priority 1)*

Evidence: Kluger & DeNisi 1996 (d=0.41, ~1/3 negative); Bansal 2021; Buçinca
2021; Magesh et al. 2024 (RAG legal tools hallucinate 17–33%). Strength: **STRONG**.

Feedback must state (verbatim 7): *"what was correct, where reasoning weakened,
how independently it was solved, whether assistance was over-used, and what
strategy to try next."*

- I1. Task-focused, never self-focused (Kluger & DeNisi: effectiveness falls as
  attention moves to the self).
- I2. Rubric / structured output schema (fixed schema constrains hallucination —
  Béchard & Marquez 2024).
- I3. Verified answer-key grounding — **primary technique, use everywhere possible**.
- I4. Confidence gating with explicit refusal: *"I'm not sure, try this strategy"
  beats a wrong answer*.
- I5. Counter-explanations as a built-in cognitive forcing function (show why the
  AI might be wrong).
- I6. LLM used to *phrase hints and diagnose attempts*, **not to adjudicate
  correctness** (Recommendation, p.11).
- I7. Do NOT rely on "a better model" as the safety story.

## 4. FEATURE D — AI Fading  *(priority 2)*

Evidence: Koedinger & Aleven; VanLehn; Parasuraman & Manzey 2010. Strength: **MODERATE**.

- D1. Support levels **1 (strong hints) → 5 (no AI)**.
- D2. Tied to a competence estimate; adaptive and **reversible** (7, 14).
- D3. Student can see and influence their level (7).
- D4. Fading triggered by sustained unaided success (7).
- D5. Show rationale: *"You've solved 3 unaided — dropping to lighter hints"* (9).
- D6. Measure: support level over time; unaided success rate at each level;
  regressions when faded (10).
- D7. Frame as "levelling up skill", not levelling down support (11).

## 5. FEATURE E — Brain-Only Mode  *(priority 3)*

Evidence: aviation deskilling; Parasuraman & Manzey 2010. Strength: **MODERATE by analogy**.

- E1. Scheduled AI-free sessions. **No AI during the session by design** (8).
- E2. Student solves, then self-checks against keys afterward (7).
- E3. Output: unaided performance record + comparison to assisted performance (9).
- E4. Measure the **assisted−unaided gap** as a dependence signal (10).
- E5. "AI-free streak" as a badge of competence (11).
- E6. Reward completion and improvement, **not speed** (12).
- E7. Keep sessions short; frame as athletic training; make unaided wins
  high-status (14).

## 6. FEATURE F — Independence Profile (NOT a score)  *(priority 3)*

Strength: **THEORETICAL / EVIDENCE-INSUFFICIENT for a single valid score.**

- F1. Dashboard of sub-metrics, never one number (7, 14).
- F2. Dimensions: unaided accuracy, hint reliance, persistence, delayed
  retention, transfer (7).
- F3. Show **confidence intervals** (14).
- F4. Label every metric a behavioural proxy, not a validated construct (10, 14).
- F5. Per-dimension progress, **no global ranking** (12).
- F6. Deterministic computation, no generative scoring (15).

## 7. FEATURE G — AI Dependency Dashboard  *(priority 2)*

Evidence: Risko & Gilbert 2016 cost-benefit model. Strength: **MODERATE mechanism**.

- G1. "Today you solved 82% independently"; "Hint reliance down 14% this week" —
  as behavioural facts **with definitions** (7).
- G2. Measure: % tasks independent; hint reliance; help-seeking timing (10).
- G3. Pair with unaided-performance reality checks; **never shame** (14).
- G4. Do not overclaim it measures "cognition" (17).

## 8. FEATURE H — Reflection / confidence calibration  *(priority 3)*

Evidence: Bisra et al. 2018 (g=0.55); Kluger & DeNisi 1996. Strength: **MODERATE
for calibration; INSUFFICIENT that reflection alone reduces offloading.**

- H1. "How confident are you?" **before** submitting (7).
- H2. After grading, show predicted vs actual (7).
- H3. Output a calibration curve (over/under-confidence) (9).
- H4. Measure calibration error; self-explanation quality; change in
  help-seeking (10).
- H5. Reward accurate calibration, not just correctness (12).
- H6. Keep attention on the task, not the ego; pair reflection with action
  prompts (14).

## 9. FEATURE A — Daily challenges, curriculum-embedded  *(priority 2)*

Evidence: Adesope et al. 2017 (217 studies, g≈0.61; secondary g≈0.83); Firth et
al. 2021. Strength: **STRONG for near/curricular retrieval; STRONG-NEGATIVE for
far transfer.**

- A1. Daily **5–10 min** set of **curriculum-linked** retrieval/reasoning items (7).
- A2. **Interleaved** problem types (7).
- A3. Delayed re-tests scheduled by a **spacing algorithm** (7).
- A4. AI generates item variants and distractors; **AI does NOT solve for the
  student**; answers grounded in a verified key (8).
- A5. Measure unaided accuracy; delayed retention at a **1–7 day** gap; near-
  transfer accuracy on novel item variants (10).
- A6. "Beat your retention" framing rather than raw score (11).
- A7. Streaks tied to **retrieval attempts, not correctness**; **avoid speed
  leaderboards** (12).
- A8. Never advertise IQ/general-ability gains (14).

## 10. Independence-weighted XP  *(replaces completion XP)*

Verbatim structure (p.12):

| Award | Amount | Basis |
|---|---|---|
| Independent solution / solving without assistance | **+10** | Risko & Gilbert; Bastani |
| Persistence after an incorrect attempt | **+5** | Liu et al. 2026; Duckworth |
| Self-explanation | **+5** | Bisra 2018 (g=0.55) |
| Self-correction | **+5** | Kapur |
| Transfer to a new problem type | **+10** | Sinha & Kapur |
| Strategic hint use | **+2** | rewards appropriate help-seeking, not hint avoidance |
| Unnecessary AI dependence | **0** | removes the payoff driving offloading |

- X1. Keep rewards **informational/feedback-like rather than controlling** (Deci
  et al. 1999 — positive competence feedback was the one reward type that
  *enhanced* motivation, d=0.33).
- X2. Monitor: gaming the attempt requirement, speed over accuracy,
  external-reward dependence, competition anxiety.

## 11. Nine additional features (p.13–14)

| # | Feature | Mechanism / evidence | Measure |
|---|---|---|---|
| N1 | **Retrieval-before-AI** — require a memory attempt before any AI help | generation effect; Adesope g≈0.61 | unaided accuracy, delayed retention |
| N2 | **AI-free streaks** — consecutive unaided sessions | anti-deskilling | unaided trend |
| N3 | **Delayed feedback** — withhold feedback briefly | desirable difficulty; larger testing effects at 1–6 day gaps | delayed retention |
| N4 | **Error journals** — log and revisit mistakes, write *why* the error occurred | self-explanation + productive failure | misconception recurrence |
| N5 | **Prediction-before-answer** — commit a prediction first | calibration + generation | calibration error |
| N6 | **Transfer challenges** — apply a strategy to a novel context | Sinha & Kapur transfer gains | transfer accuracy |
| N7 | **Interleaving mode** — mix problem types | discrimination learning; Firth 2021 | discrimination accuracy |
| N8 | **Spaced retrieval scheduler** — expanding intervals | Cepeda 2006; Adesope 2017 | long-delay retention |
| N9 | **Explain-it-back** — teach the concept back | protégé effect; Bisra g=0.55 | self-explanation quality, retention |

## 12. Measurement framework (p.14)

- M1. **Primary outcomes**: unaided post-test accuracy; delayed retention (1–7+
  days); transfer to novel problems.
- M2. **Secondary**: persistence (skip/give-up rate); help-seeking timing; hint
  reliance; self-explanation quality; metacognitive calibration error.
- M3. **Product metrics**: % tasks completed independently; AI-use frequency;
  retention/DAU; streak adherence.
- M4. **Longitudinal**: trajectory of the **assisted−unaided gap** (dependence
  signal); durability of gains over months.
- M5. Every in-app metric explicitly labelled a behavioural proxy until
  externally validated.

## 13. Experimental framework (p.14–15)

- E1. Users assigned to experiment arms; assignment persisted.
- E2. **Attempt-first RCT**: Control = answer-on-demand; Treatment =
  attempt-first + scaffolded fading hints. Powered to detect g≈0.3.
- E3. AI Tutor A/B: hint-first vs answer-first.
- E4. Gamification A/B: independence-XP vs completion-XP vs no-XP.
- E5. Feedback A/B: rubric/key-grounded vs free-form.
- E6. Fading RCT: adaptive vs fixed support.
- E7. Model-switch probe — **only after the above**, unmarketed.

## 14. Staged rollout (p.15–16)

- Stage 0 — Attempt-First (B) + hint-first Tutor (C) + key-grounded feedback (I).
- Stage 1 — Fading (D), independence profile (F), dependency dashboard (G).
- Stage 2 — Retrieval/spacing/interleaving (A), reflection (H), independence XP.
- Stage 3 — Opt-in "Most Improved"/independence leaderboards, skill-banded;
  model-switch probe.

## 15. Honesty requirements (Caveats, p.18)

- H1. State openly that most countermeasure evidence comes from adults,
  university students, or pre-generative technologies, applied here by inference.
- H2. Effect sizes are modest — "real but not miraculous".
- H3. No longitudinal evidence exists over the timescales that matter.
- H4. Treat Anchor's own strong claims as hypotheses.
- H5. Gerlich (2025) correlational n=666; Kosmyna (MIT 2025) n=54 non-peer-
  reviewed preprint; Kestin single-institution N=194 — motivating context, not proof.
