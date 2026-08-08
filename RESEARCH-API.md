# Research layer — module and route contracts

Fixed interfaces between the research-spec modules. Build against these
exactly; do not fork the shapes in `lib/research/types.ts`.

## Module ownership

| Path | Owns |
|---|---|
| `lib/research/types.ts` | shared contract (**built — do not modify**) |
| `lib/research/support.ts` | Feature D fading: level from competence, gate decisions |
| `lib/research/xp.ts` | §10 independence XP scoring |
| `lib/research/independence.ts` | Feature F/G: dimensions, Wilson CI, assisted−unaided gap |
| `lib/research/experiments.ts` | §13 arm assignment (deterministic hash of user+experiment) |
| `lib/research/items.ts` | item selection: interleaving (N7), due reviews (N8), transfer (N6) |
| `lib/research/tutor.ts` | Feature C Socratic tutor + Feature I structured feedback, key-grounded |
| `lib/research/calibration.ts` | Feature H calibration error + curve |

## Routes

All under `/api/learn`. Zod-validated, JSON `{ error: string }` on failure.
Auth via cookie session; service-role writes only after verifying the caller.

| Route | Method | Body → Response |
|---|---|---|
| `/api/learn/start` | POST | `{ mode, subject?, topic? }` → `{ attemptId, state: AttemptState }` |
| `/api/learn/attempt` | POST | `{ attemptId, answer, confidence? }` → `{ outcome, state, xp, feedback? }` |
| `/api/learn/hint` | POST | `{ attemptId }` → `{ helpLevel, text, grounded, state }` — **403 until the attempt gate opens (B1)** |
| `/api/learn/stuck` | POST | `{ attemptId }` → escalation path (B7) |
| `/api/learn/solution` | POST | `{ attemptId }` → 403 unless `attemptsBeforeSolution` met (B4) |
| `/api/learn/explain-back` | POST | `{ attemptId, explanation }` → `{ score, feedback }` (N9, C4) |
| `/api/learn/tutor` | POST | `{ attemptId, message }` → `{ reply, misconceptionTag, refused }` (C) |
| `/api/learn/finish` | POST | `{ attemptId, confidenceAfter?, selfExplanation? }` → `{ feedback, xp, nextReview }` |
| `/api/learn/journal` | POST | `{ itemAttemptId, whatWentWrong, whatToDoNext }` (N4) |
| `/api/learn/review/due` | GET | due items for today (N8) |

## Hard rules every implementer must honour

1. **The attempt is the gate.** `/hint` returns 403 with a reason until
   `attemptsMade >= support.attemptsBeforeHelp`. No exceptions, no query param
   that bypasses it. (B1)
2. **The answer key never reaches the client.** Read items through
   `items_public`; the key is loaded server-side only for grading and grounding.
3. **The LLM never adjudicates correctness.** Grading is deterministic against
   `answer_key`. The model phrases hints and diagnoses attempts only. (I6)
4. **Ungrounded means refuse.** If a hint cannot be grounded against the key,
   fall back to a generic strategy prompt and set `grounded: false`. Never
   invent. (B8, I4)
5. **No composite score.** Nothing computes or displays a single
   "independence score". Dimensions only, each with sample size. (R1, F1)
6. **XP rewards independence, never completion.** (R4, §10)
7. **Every displayed metric carries `PROXY_DISCLAIMER` nearby.** (M5, F4)
8. **Never claim intelligence or IQ gains anywhere in copy.** (A8, R2)

## Copy rules

Inherit `CONVENTIONS.md` §8 (banned vocabulary, sentence case, dry voice).
Additionally, from the research spec:

- Frame fading as levelling **up skill**, not down support (D7).
- Frame retrieval as "beat your retention", not raw score (A6).
- Never shame in the dependency dashboard (G3).
- State uncertainty plainly: sample sizes, confidence intervals, and the fact
  that these are proxies (F3, F4, M5).
