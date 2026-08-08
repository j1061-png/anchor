# Anchor — research-spec implementation status

Requirement-by-requirement against `RESEARCH-SPEC.md`. Honest: `done` means
built and typechecking; `partial` means built with a stated gap; `pending`
means not yet. Nothing past the sign-up wall has been run against a live
database — the logic is unit-tested (623 tests pass), the end-to-end wiring is
not.

Legend: ✅ done · 🟡 partial · ⬜ pending

## Rejections (§0)

| # | Requirement | Status | Where |
|---|---|---|---|
| R1 | Retire the single composite score | ✅ | `lib/engine.ts` cognitiveScore marked deprecated; dashboard hero replaced with a link to `/independence` + two dimensions; profile card no longer shows it; `research-check.sh` fails the build if it reappears in UI |
| R2 | No far-transfer brain-training claims; keep puzzles as practice | ✅ | `/about-the-evidence` states the no-transfer finding; `research-check.sh` greps for intelligence/IQ/brain-training claims |
| R3 | Rebuild leaderboards: opt-in, skill-banded, improvement/independence | ✅ | `app/(app)/leaderboard/page.tsx`; migration `20260805000100_leaderboards.sql` (opt-in column, `most_improved_board` + `independence_board` views, `ability_band`) |
| R4 | XP rewards independence, not completion | ✅ | `lib/research/xp.ts`; session attempt route now scores via `scoreAttempt`; streaks reframed to retrieval/AI-free |
| R5 | Model-switch only as an unmarketed probe | ✅ | `experiments.ts` `model_switch` arm exists, flagged `unmarketed: true`; no UI markets it |

## Feature B — Attempt-first (flagship)

| # | Status | Where |
|---|---|---|
| B1 attempt is the gate | ✅ | `lib/research/support.ts` `helpGate`; `/api/learn/hint` 403s until the gate opens; `/learn` UI hides the hint button pre-attempt |
| B2 attempt chain recorded | ✅ | `attempt_steps` table + `record_attempt_step` RPC |
| B3 AI diagnoses, selects next hint | ✅ | `tutor.diagnoseAttempt`, `_lib/help.escalate` |
| B4 solution only after effort | ✅ | `/api/learn/solution` 403s until `attemptsBeforeSolution`; gate in `support.ts` |
| B5 measures (think time, attempts, %unaided, persistence) | ✅ | `item_attempts` columns; `roll_independence` RPC |
| B6 "cracked it with 1 hint" framing | ✅ | `/learn` UI |
| B7 low-effort detection + "I'm stuck" | ✅ | `grader.isLowEffort`; `/api/learn/stuck` route |
| B8 ungrounded → strategy prompt, never invent | ✅ | `tutor.generateHint` returns `grounded:false` with a strategy fallback |

## Feature C — Hint-first Socratic tutor

| # | Status | Where |
|---|---|---|
| C1 asks what you think first | ✅ | `tutor.socraticTurn` |
| C2 one step at a time | ✅ | help ladder escalates one rung |
| C3 names the misconception | ✅ | `diagnoseAttempt`; `misconception_tag` on turns |
| C4 asks you to explain back | ✅ | `/api/learn/explain-back` |
| C5 fades as competence rises | ✅ | via Feature D support level |
| C6 never full solution on demand | ✅ | gate + level cap |
| C7 transcript + tag + prompt | ✅ | `tutor_turns` table |
| C8 brevity constraint | ✅ | `tutor.ts` prompt caps hints < 30 words |
| C9 refuse when unsure | ✅ | `refused`/`refusalReason` on turns |
| C10 measures | ✅ | recorded on `item_attempts` / `tutor_turns` |

## Feature I — Key-grounded feedback

| # | Status | Where |
|---|---|---|
| I1 task-focused, not self | ✅ | `structuredFeedback` schema |
| I2 rubric / structured schema | ✅ | `StructuredFeedback` type; `rubric` on items |
| I3 verified answer-key grounding | ✅ | `grader.ts` (deterministic); keys never leave server (`items_public` view, `toPublicItem`) |
| I4 confidence gating + refusal | ✅ | `refused` path in tutor + feedback |
| I5 counter-explanation | ✅ | `counterExplanation` field; shown in `/learn` |
| I6 LLM never adjudicates correctness | ✅ | grading is `grader.gradeAnswer`, deterministic; `research-check` + tests assert |
| I7 no "better model" as safety story | ✅ | grounding is the safety story; documented |

## Feature D — AI fading

| # | Status | Where |
|---|---|---|
| D1 levels 1–5 | ✅ | `SUPPORT_POLICIES` in `types.ts` |
| D2 adaptive + reversible | ✅ | `computeSupportLevel` (raises on streak, lowers on regression) |
| D3 student can see/influence | 🟡 | level is computed and shown; a student "pin" is supported in `support.ts` but the `/learn` control to set it is minimal |
| D4 fade on sustained unaided success | ✅ | `FADE_STREAK` |
| D5 shows rationale | ✅ | `fadingRationale` |
| D6 measures | ✅ | `support_level_at_time` on attempts |
| D7 framed as levelling up skill | ✅ | copy in `support.ts`/`/learn` |

## Feature E — Brain-Only mode

| # | Status | Where |
|---|---|---|
| E1 no AI during session | ✅ | gate returns no help when `mode = brain_only` (`support.ts:280`); page renders no hint affordance |
| E2 self-check against key after | ✅ | `/brain-only` post-session self-check |
| E3 unaided record + comparison | ✅ | `brain_only_sessions` + independence gap |
| E4 assisted−unaided gap | ✅ | `independence.assistedUnaidedGap` |
| E5 AI-free streak badge | ✅ | `profiles.ai_free_streak`; nav/streak copy |
| E6 reward completion/improvement not speed | ✅ | no time shown or ranked |
| E7 short, high-status | ✅ | `/brain-only` copy |

## Feature F — Independence profile (not a score)

| # | Status | Where |
|---|---|---|
| F1 dimensions, never one number | ✅ | `independence.buildProfile`; test asserts no composite export |
| F2 six dimensions | ✅ | unaided accuracy, hint reliance, persistence, delayed retention, transfer, calibration |
| F3 confidence intervals | ✅ | `wilsonInterval`; shown per card |
| F4 labelled as proxies | ✅ | `ProxyNote` / `PROXY_DISCLAIMER` |
| F5 per-dimension, no global rank | ✅ | `/independence` |
| F6 deterministic, no generative scoring | ✅ | pure arithmetic |

## Feature G — Dependency dashboard

| # | Status | Where |
|---|---|---|
| G1 behavioural facts with definitions | ✅ | `/independence` dimension cards |
| G2 %independent, hint reliance, timing | ✅ | dimensions + `trend` |
| G3 never shame | ✅ | neutral copy; no red warnings |
| G4 does not overclaim cognition | ✅ | proxy notes |

## Feature H — Reflection / calibration

| # | Status | Where |
|---|---|---|
| H1 confidence before submitting | ✅ | `/learn` slider; `confidence_before` first-attempt only |
| H2 predicted vs actual after | ✅ | `/learn` finish |
| H3 calibration curve | ✅ | `calibration.calibrationCurve`; `calibration-chart.tsx` |
| H4 measures | ✅ | `calibration_error` on `independence_daily` |
| H5 reward accurate calibration | 🟡 | calibration is measured and shown; XP does not yet award a separate calibration bonus (the §10 table has no calibration line, so this is faithful to the spec's XP list but H5's "reward" is via visibility, not points) |
| H6 task-focused, not ego | ✅ | `calibrationVerdict` tested against ego vocabulary |

## Feature A — Curriculum daily challenges

| # | Status | Where |
|---|---|---|
| A1 5–10 min curriculum set | ✅ | `items.selectDailySet` |
| A2 interleaved | ✅ | `selectDailySet` alternates skills; test asserts no consecutive repeat |
| A3 spacing scheduler | ✅ | `reviews` table + `schedule_review` RPC (SM-2 style) |
| A4 AI generates variants, not solutions | ✅ | keys are authored/verified; grading deterministic |
| A5 delayed retention 1–7 days, near transfer | ✅ | `reviews` intervals; `independence_daily` retention counters |
| A6 "beat your retention" framing | ✅ | `/review` copy |
| A7 streak = retrieval attempts, not correctness | ✅ | `profiles.retrieval_streak`; copy |
| A8 never claim IQ gains | ✅ | audited |

## §10 — Independence XP

| # | Status | Where |
|---|---|---|
| X-table (+10/+5/+5/+5/+10/+2/0) | ✅ | `xp.ts` matches the table exactly; tests assert every line |
| X1 informational, not controlling | ✅ | labels describe behaviour; recap reframed |
| X2 monitor gaming | ✅ | low-effort zeroes the item; documented |

## §11 — Nine additional features

| # | Status | Where |
|---|---|---|
| N1 retrieval-before-AI | ✅ | the attempt gate is exactly this |
| N2 AI-free streaks | ✅ | `ai_free_streak` |
| N3 delayed feedback | 🟡 | spaced review delivers delayed re-tests; a deliberate "withhold feedback briefly" toggle on a single item is not built |
| N4 error journal | ✅ | `error_journal` table; `/journal`; `/api/learn/journal` |
| N5 prediction-before-answer | ✅ | confidence-before slider (H1) |
| N6 transfer challenges | ✅ | `transfer` item kind; `items.selectTransferVariant` |
| N7 interleaving mode | ✅ | `selectDailySet` |
| N8 spaced scheduler | ✅ | `schedule_review`; `/review` |
| N9 explain-it-back | ✅ | `/api/learn/explain-back`; `scoreSelfExplanation` |

## §12–§15 — Measurement, experiments, honesty

| # | Status | Where |
|---|---|---|
| M1–M5 measurement framework | ✅ | `independence_daily` captures primary/secondary/gap; every metric carries a proxy note (M5) |
| §13 experiment arms, sticky | ✅ | `experiments.ts`; `experiment_assignments` table; attempt-first control arm (answer-on-demand) implemented in `/api/learn/hint` |
| §14 staged rollout | 🟡 | all stages' features exist in code; there is no runtime feature-flag gating them into stages — they are all present at once |
| §15 honesty (effect sizes, caveats, no longitudinal data) | ✅ | `/about-the-evidence` states them with the real numbers |

## Known gaps and caveats

1. **No live database.** The migrations (`20260805000000_research_spec.sql`,
   `20260805000100_leaderboards.sql`) have not been applied anywhere. Nothing
   past sign-up has run end to end. `lib/database.types.ts` is hand-extended
   for the new tables/views/columns — regenerate it from the live project once
   the migrations run.
2. **Friends leaderboard metric.** The friends tab now ranks by independence,
   but `/api/leaderboard/friends` still returns the old `cognitive_score`
   field, so friend rows currently sort as if independence were 0. The friends
   route needs updating to return per-friend independence for that tab to rank
   meaningfully. (Improvement and independence tabs are unaffected — they read
   the new views directly.)
3. **Item bank is a seed, not a curriculum.** ~80 verified items across
   subjects and years — enough to exercise every path and pass the "every key
   grades its own answer" test, not enough to be a real curriculum. Real
   deployment needs an authored bank.
4. **D3 / N3 partial** as noted above.
5. **Two migrations, three now.** Apply in order:
   `20260804000000_init` → `20260805000000_research_spec` →
   `20260805000100_leaderboards`.

## Verification run

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 623 tests pass (13 files).
- `bash scripts/research-check.sh` — exit 0 (all hard rules hold).
