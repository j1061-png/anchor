# Anchor — build conventions

Read SPEC.md first. This file covers what the spec leaves open plus the
decisions already made. Do not contradict either.

## Fixed decisions

- Six categories: `spatial, problem_solving, pattern, logic, memory,
  mental_math` (see `lib/types.ts`, which is the single source of truth for
  shared shapes — extend it if you must, never fork copies of its types).
- Puzzle→category mapping lives in `PUZZLE_CATEGORIES` in `lib/types.ts`.
- The `PuzzleProps` interface has a fourth member `onGrade` beyond the spec's
  three: grading happens on the server (solutions never ship to the client),
  so components submit through `onGrade`, show feedback + explanation, then
  report `onSolve`.
- Seeded RNG: `createRng(seed)` from `lib/rng.ts` in every generator. Grading
  regenerates the puzzle from `(type, seed, difficulty)` — generators must be
  pure and deterministic.
- Scoring constants live in `lib/types.ts` (`ELO_K`, `HINT_SCORE_COST`,
  `xpForPuzzle`, `levelForXp`, `HINT_LOCK_MS`).
- Supabase: `lib/supabase/server.ts` (user-scoped), `client.ts` (browser),
  `admin.ts` (service role — only in API routes, only for writes clients are
  not allowed to make). Scoring tables have no client write path by design.
- All API route inputs validated with Zod. All routes return JSON errors as
  `{ error: string }` with a proper status.
- Anthropic calls: model `claude-sonnet-4-6`, server routes only.

## Design tokens (already in app/globals.css — use them, never restate hexes)

- Colours: `bg-paper text-ink text-slate bg-flag bg-gold bg-chalk`,
  block fills `bg-block-1` … `bg-block-6` (puzzle pieces only).
- Type: `font-display` (Bricolage, headings/big numbers), body default
  (Public Sans), `.num` or `font-data` (Martian Mono — every number: timers,
  scores, XP, ranks, ratings).
- Surfaces: `.plane` (card: chalk, 1px ink border, hard offset shadow, 10px
  radius), `.plane-sm` (small control surface, 2px radius). Pills (`rounded-full`)
  only on primary action buttons. No other radii.
- Components: `Button`, `Card`, `Input` in `components/ui/`; `ThinkTimer` /
  `BlockMeter` in `components/ui/think-timer.tsx`; `Wordmark` in
  `components/wordmark.tsx`.
- Feedback animations: `flash-correct`, `flash-wrong`, `block-pop`,
  `line-clear`, `deal-in` keyframes exist in globals.css.
- Hard bans (§7 of SPEC.md) apply to every line you write: no purple/indigo/
  violet, no Inter, no backdrop-blur, no coloured left borders on cards, no
  emoji as UI icons, no soft blurred shadows, no gradients.

## Copy rules (§8 of SPEC.md — enforced by grep before ship)

Banned words include: delve, seamless, robust, leverage, elevate, empower,
unlock*, harness, journey, landscape, crucial, vibrant, dive in, level up your…
(full list in SPEC.md §8; "unlock" is allowed only as the literal mechanic
verb for achievements — prefer "earned" instead). Voice: direct, dry, a
little competitive, sentence case everywhere. Errors say what broke and what
to try, never apologise. Buttons keep their verb across steps.

## Layout

- Signed-in pages share `app/(app)/layout.tsx` (nav shell). Puzzle screens
  are mobile-first, one-handed portrait, 44px+ touch targets.
- Route groups: `app/(app)/today`, `/practice`, `/dashboard`, `/leaderboard`,
  `/profile`, `/session/[id]`; public: `/`, `/auth`, `/c/[code]`.

## Testing

- Vitest. Generator tests live in `lib/puzzles/__tests__/`. Every generator:
  solvable at difficulties 1, 5, 10; deterministic for a fixed seed; grader
  accepts the generated solution and rejects a wrong answer.
- `npm test` runs vitest once; `npm run build` must stay green.
