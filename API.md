# Anchor — internal API and module contracts

Fixed contracts between modules. If you build one side, match the other side
exactly. All routes: JSON, zod-validated input, errors as `{ error: string }`
with a proper status. Auth = Supabase cookie session via `lib/supabase/server`.
Scoring writes use `lib/supabase/admin` after verifying the caller.

## Sessions and the engine

`lib/engine.ts` (owned by the engine module):
- `selectDailySlots(admin, userId): Promise<SessionSlot[]>` — §5 rules: 3 from
  two weakest categories, 2 from anywhere, expected win rate 60–75%, no same
  type back to back, never a seed in the user's `attempts` history.
- `eloUpdate({ rating, difficulty, correct, hintsUsed OR tiersUsed, fasterThanMedian })`
  → new rating (K=32, hint costs from `HINT_SCORE_COST`, speed bonus 0.1,
  score clamped 0..1).
- `completeSession(admin, userId, sessionId)` — score, accuracy, xp totals,
  streak update in the user's timezone (freeze logic per §6), level, cognitive
  score (recency-weighted mean of six ratings, 0–1000 scale), writes
  `sessions.cognitive_score_after`, calls `evaluateAchievements` from
  `lib/achievements.ts`, calls `refresh_weekly_xp` RPC, calls
  `generateRecapFeedback` from `lib/ai.ts`.
- Streak helpers in `lib/streak.ts` with vitest tests (`lib/__tests__/streak.test.ts`):
  pure function `advanceStreak({ current, longest, freezes, lastSessionDate, todayLocalDate })`.

Routes (owned by the engine module):
- `POST /api/session/start` body `{ type: "daily" } | { type: "practice", category, difficulty } | { type: "challenge", code }`
  → `{ sessionId }`. Daily: one per user-local day (unique index) — returns the
  existing session id if today's already exists. Practice: 5 puzzles of the
  chosen category/difficulty (mixed types that can serve that category).
  Challenge: seeds copied from the challenge row; 403 if expired.
- `GET /api/session/[id]` → `{ session: { id, type, status, date, startedAt },
  slots: SessionSlot[], puzzles: PuzzleInstance[] (payloads for EVERY slot,
  via generatePuzzle — no solutions), attempts: { slotIndex, correct, timeMs,
  hintsUsed }[] }`. Owner only.
- `POST /api/session/[id]/attempt` body `{ slotIndex, answer, timeMs, hintTiersUsed: number[] }`
  → grades via `gradeAnswer`, records the attempt (xp minus `HINT_XP_COST`
  per tier, halved for practice), Elo-updates the slot's category, and returns
  `{ correct, solution, explanation, xpEarned, ratingDelta, sessionComplete }`.
  Rejects duplicate slot submissions (409) and out-of-range slots.
- `GET /api/session/[id]/recap` → `{ perPuzzle: [...], xpEarned, accuracy,
  ratingMoves: { category, delta }[], streak: { current, extended, frozeUsed },
  feedback: string, newAchievements: string[] }`. Only for complete sessions.

## Client contracts

Puzzle components (files fixed): `components/puzzle/blockfit.tsx`,
`ruleshift.tsx`, `recall.tsx`, `mentalmath.tsx`. Named exports
`BlockFitPuzzle`, `RuleShiftPuzzle`, `RecallPuzzle`, `MentalMathPuzzle`, all
`(props: PuzzleProps)` from `lib/types.ts`. They render ONLY the puzzle body —
`components/puzzle/frame.tsx` (`PuzzleFrame`, already built) provides the
think timer, hint ladder (45s lock included), and explanation panel. Flow
inside a component: user answers → `await onGrade(answer)` → play the
correct/incorrect feedback (flash keyframes exist in globals.css) → after
~1.2s call `onSolve({ correct, timeMs, hintsUsed, attempts, answer })`. The
session page treats its own clocks/hint counts as authoritative; a component's
`timeMs`/`hintsUsed` are advisory.

Session player (owned by the session-pages module):
`app/(app)/session/[id]/page.tsx` + client player. Owns: per-puzzle
`startedAt`, hint state (`POST /api/hint` with `{ type, seed, difficulty,
tier, attempt }` → `{ hint }`, tiers strictly 1→2→3), attempt submission,
slot advancing, the deal-in stagger on entry, and the recap screen at the end
(fetch `/recap`). `/today` and `/practice` pages also owned there.

## Challenges (owned by the social module)

- `POST /api/challenge` `{ category, difficulty }` → `{ code, url }` (6-char
  code, 5 seeds, expires 7 days).
- `/c/[code]` public page: shows challenge, signed-out users pushed to
  `/auth?next=/c/[code]`; signed-in → `POST /api/session/start { type:
  "challenge", code }` → player. Completion writes `challenge_results`
  (engine does this when completing a challenge session).
- Results compare view on `/c/[code]` once the viewer has a result.
- Share cards: `GET /api/share/[type]/[id]` via next/og (ImageResponse),
  1080×1080, graph-paper background, wordmark. Types: `score/[sessionId]`,
  `streak/[userId]`, `achievement/[achievementRowId]`. Public route (in
  middleware matcher exclusions already).
- Referral: share URLs carry `?ref=<friend_code>`; the auth page forwards it
  into signup metadata; the DB trigger credits the referrer 50 xp.

## Friends / profile (owned by the profile module)

Direct Supabase client calls under RLS: friendships insert/update/delete, own
profile update (allowed columns only). Friend lookup by code via RPC
`lookup_friend_code(code)` (security definer). Server route only where RLS
cannot express it.

## Leaderboards (owned by the leaderboard module)

Reads: `leaderboard_view` (global/school by cognitive_score), `weekly_xp_mv`
joined to the view (weekly), friendships + profiles (friends tab, includes
private profiles of accepted friends — fetch via a server route with admin
client, verifying friendship). Paginate 50. Current user's row highlighted;
if outside the page, pin their rank at the bottom (compute rank via a count
query on the view).
