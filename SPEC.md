You are building and shipping a production web app called **Anchor**. It goes live today. Treat every instruction here as a hard requirement unless a section explicitly marks something optional. Do not produce placeholder screens, `TODO` comments, mock data arrays, or "coming soon" states. Every button in the final build must do something real.

## 1. What Anchor is

A daily cognitive training app that fights cognitive offloading. People have got used to handing every problem straight to an AI. Anchor gives them a short set of puzzles each day that they have to work through themselves before any help is offered.

The user opens the app, gets a daily session of 5 puzzles, solves them, sees where they went wrong, and watches their scores and streak move. They compete with classmates and friends. That is the whole product.

Audience: students aged roughly 14 to 22. This is closer to a mobile game than to a productivity tool. It must not feel like homework.

## 2. Stack

Use exactly this. Do not substitute.

- **Next.js 15**, App Router, TypeScript, strict mode
- **Tailwind CSS v4** with a custom token layer (see §7)
- **Supabase** for Postgres, Auth, and Row Level Security
- **@supabase/ssr** for cookie-based auth in the App Router (not the deprecated auth-helpers)
- **Anthropic API** (`claude-sonnet-4-6`) called only from server routes, never the client
- **Recharts** for the dashboard charts
- **Vercel** for deploy
- **Zod** for validating every API route input

No Redux, no tRPC, no ORM. Use the Supabase client directly. Keep the dependency list short because build time matters today.

## 3. Auth — must be complete

Three sign-in methods, all functional:

1. **Email + password.** Sign up, sign in, sign out, password reset via emailed link, and a real "check your inbox" confirmation screen. Handle the already-registered case with a message that tells the user to sign in instead.
2. **Google OAuth** via Supabase provider.
3. **Apple OAuth** via Supabase provider.

Requirements for all three:

- One combined `/auth` page that toggles between sign up and sign in. Do not build two separate pages.
- OAuth buttons use the official Google and Apple marks and follow their brand rules: Apple's button is black with the Apple logo and the exact text "Sign in with Apple"; Google's is white with the four-colour G and "Continue with Google". Do not restyle these into your own palette.
- `/auth/callback` route handler that exchanges the code for a session and redirects to `/onboarding` for new users or `/today` for returning ones.
- Middleware at the project root that refreshes the session on every request and guards `/today`, `/dashboard`, `/leaderboard`, `/profile`, `/session/*`. Unauthenticated users hitting those get bounced to `/auth` with a `?next=` param that returns them after login.
- Errors surface in the UI. A failed login shows "That email and password don't match" under the form, not a console log.

**Apple gating.** Apple Sign In needs a paid Apple Developer account, a Services ID, a signing key, and a verified domain. If that is not provisioned yet, the deploy must not break. Put the Apple button behind `NEXT_PUBLIC_APPLE_AUTH_ENABLED`. When the flag is `false` the button does not render and nothing else changes. Write the full working integration regardless, so flipping the flag to `true` is the only step needed later. Document the exact Apple Developer setup steps in `README.md`.

**Onboarding** at `/onboarding`, shown once after first sign-up. Four steps, one screen each, with a progress indicator:

1. Display name and optional avatar emoji picker
2. School name (free text with autocomplete against existing schools in the DB, so classmates land in the same group) and year group
3. A 3-question calibration puzzle, one from each of three categories, used to seed starting difficulty ratings
4. Daily reminder time preference, stored on the profile

Write the profile row on completion and redirect to `/today`.

## 4. Core loop

### Daily session

`/today` shows the day's session: 5 puzzles, chosen by the adaptive engine. State is one of: not started, in progress, complete. A completed session shows the recap and a countdown to tomorrow's, not a replay.

Users can also run **practice sessions** at `/practice`, where they pick a category and difficulty. Practice affects category ratings but not the streak, and awards half XP. Make that difference visible in the UI so it does not feel like a bug.

### Puzzle engine

Build four puzzle types. Each is a self-contained React component with a shared interface:

```ts
interface PuzzleProps {
  puzzle: PuzzleInstance;
  onSolve: (result: SolveResult) => void;
  onHintRequest: (tier: 1 | 2 | 3) => Promise<string>;
}

interface SolveResult {
  correct: boolean;
  timeMs: number;
  hintsUsed: number;
  attempts: number;
  answer: unknown;
}
```

All puzzles are **generated procedurally at request time on the server** from a seed. No hardcoded puzzle bank. Every generator takes a difficulty integer 1–10 and returns a puzzle plus its solution. The solution never reaches the client until the user has answered.

**1. BlockFit** (spatial awareness, problem-solving)
A grid, partially filled, plus a tray of 3 tetromino/pentomino-style pieces. The user drags pieces onto the grid to clear complete rows and columns, Block Blast style. The win condition is clearing a target number of lines within the given pieces. Pieces are rotatable at difficulty 4+. Must work with both mouse drag and touch drag. Show a ghost preview of where the piece will land and grey out illegal placements. Difficulty scales grid size (6×6 up to 10×10), piece irregularity, and how tight the solution space is.

**2. RuleShift** (pattern recognition, logical reasoning)
Show two or three worked examples of a transformation applied to a small coloured grid: rotate, reflect, recolour by rule, shift, count-and-replace, or a composition of two of those. Then show a fresh input and four candidate outputs. The user picks the one that follows the same rule. Difficulty scales the number of composed operations and the plausibility of the distractors. Distractors must be near-misses, not random, or the puzzle is trivially solvable by elimination.

**3. Recall** (memory)
A grid flashes a sequence of lit cells. The user reproduces it. At difficulty 5+, switch to an n-back variant: a stream of symbols, the user flags when the current one matches the one n steps back. Difficulty scales sequence length, flash speed, and n.

**4. MentalMath** (mental maths, logical reasoning)
Multi-step arithmetic and number reasoning under a visible timer. Not drill sheets. Mix formats: reach a target from four numbers, find the missing operator, estimate which of two expressions is larger, work backwards from a result. No calculator, and the number pad is custom so the OS keyboard does not cover the puzzle on mobile.

### The hint ladder

Hints are the point of the product, so build them carefully.

- The hint button is **disabled for the first 45 seconds** of every puzzle. It shows a filling ring so the user can see the wait, with the label "Think first".
- Tier 1 is a **question, not information**: "What stays the same between the two examples?" Never reveals a fact.
- Tier 2 narrows the search space: "The change involves the corners only."
- Tier 3 gives the next concrete move but not the answer.
- Full explanation is only available **after the user submits an answer**, right or wrong.

Each tier costs XP and is recorded. Generate hint text through the Anthropic API server route, passing the puzzle structure, the user's current attempt, and the tier. Cache hint responses by `(puzzle_type, seed, tier)` in a `hint_cache` table so repeat puzzles cost nothing and return instantly.

### Session recap

After puzzle 5, show a recap screen: per-puzzle result, time taken, hints used, XP earned, category ratings moved up or down, streak status. Then one AI-written paragraph, no more than 60 words, naming the single clearest weakness from this session and one concrete thing to practise. It must reference the actual puzzles just played. Generic encouragement is a failure.

## 5. Adaptive engine

Per user, per category, keep an Elo-style rating starting at 1000.

- Each puzzle has an implied rating from its difficulty: `800 + difficulty * 60`.
- On solve, update with K=32, treating a correct answer as a win.
- Hints reduce the effective score: tier 1 costs 0.15, tier 2 costs 0.3, tier 3 costs 0.5 of the win value.
- Response time faster than the category median gives a 0.1 bonus, capped at 1.0.

Session selection: 3 puzzles from the user's two weakest categories, 2 from anywhere, difficulty set so the expected win rate lands between 60% and 75%. Never serve two puzzles of the same type back to back. Never repeat a seed the user has already seen.

Cache today's five puzzle seeds on the session row when it is created, so a refresh does not reroll the session.

## 6. Scores, streaks, dashboard

**Cognitive score**: a single 0–1000 number, the weighted mean of the six category ratings, weighted by how recently each was tested. Show its movement over time.

Track and display:
- Accuracy overall and per category
- Median response time per category
- **Hint independence**: percentage of puzzles solved without any hint. Give this equal billing with accuracy on the dashboard, because it is the metric that reflects the app's actual purpose.
- **Think time**: median seconds spent before the first hint or first answer
- Strengths and weaknesses, derived as the top two and bottom two categories by rating
- Streak: consecutive days with a completed daily session, computed in the user's timezone. One **streak freeze** earned every 7 days, consumed automatically on a missed day, maximum of 2 banked.
- XP and level, with a curve of `level = floor(sqrt(xp / 100))`
- Achievements, at least 16 of them, mixing volume (100 puzzles), independence (20 hint-free in a row), consistency (30-day streak), and category mastery (rating above 1400 in any category). Unlock triggers fire in a single server function evaluated after each session.

Dashboard at `/dashboard`: cognitive score with a sparkline, a radar chart of the six categories, a line chart of score over time with a range selector, an accuracy-versus-hint-independence view, a calendar heatmap of the last 90 days, and the achievement grid with locked items shown as silhouettes.

## 7. Design direction

This is where most generated apps give themselves away. Follow this section exactly.

### Hard bans

Do not use any of the following, anywhere:

- Purple, indigo, or violet as a brand colour. No blue-to-purple gradients. No `indigo-500`, `violet-600`, or their neighbours.
- Inter, or a bare `font-sans` fallback, as the primary typeface.
- Glassmorphism: no `backdrop-blur` frosted panels.
- Cards with a 3–4px coloured left border. This is the single most recognisable generated-design tell.
- A three-column grid of feature cards with an icon on top of each.
- Uniform border radius across every element. Vary it deliberately by component role.
- Fade-and-rise-on-scroll applied to every section.
- Emoji used as interface icons in buttons or nav.
- Dark background with a single acid-green or vermilion accent.
- Cream `#F4F1EA` paired with a warm terracotta near `#D97757`. This combination is itself a generated-design cliché now.
- Stock illustrations of any kind, including AI-generated ones.

### The direction to build instead

Anchor's world is graph paper, arcade cabinets, and the exam-hall stopwatch. Light, physical, slightly analogue, with the block puzzle as the visual motif that runs through everything.

**Palette** (define these as CSS custom properties and derive everything from them):

```
--paper:  #E4E7DC   /* pale sage, the graph-paper base */
--ink:    #16190F   /* deep olive-black, all body text  */
--slate:  #6E7A63   /* muted sage, secondary text, rules */
--flag:   #E01B54   /* crimson-pink: live states, timer, streak */
--gold:   #F0B429   /* mustard: XP, achievements, rewards */
--chalk:  #F7F8F4   /* raised surfaces, cards, inputs */
```

Puzzle blocks get their own six flat, saturated fills that do not overlap with the UI palette. Flat colour only, no gradients, no inner shadows.

**Typography**:
- Display: **Bricolage Grotesque**, weights 700–800, tight tracking, used for headings and big numbers
- Body: **Public Sans**, 400 and 600
- Data: **Martian Mono**, used for timers, scores, XP, ratings, and leaderboard positions

Load all three from Google Fonts with `next/font`. The mono face on every number is the thing that will make the app feel like an instrument rather than a template.

**Signature element**: the think timer. Instead of counting seconds in text, it fills a small 4×4 block grid, one cell at a time, in `--flag`. The timer is made of the same blocks as the puzzles. It appears on every puzzle screen and in miniature on the streak counter. This is the one thing the app is remembered for, so build it properly and keep everything around it quiet.

**Layout**: a faint graph-paper grid on the page background, 8px, at very low opacity. Cards sit on it as solid `--chalk` planes with a 1px `--ink` border and a hard 4px offset shadow in `--ink` at 12% opacity. No soft blurred shadows. Border radius: 2px on inputs and small controls, 10px on cards, 999px on pills and the primary action button only.

**Motion**: one orchestrated page-load stagger on the daily session screen where the five puzzle slots deal in like cards, 40ms apart. Otherwise restrict animation to state feedback: block snap, line clear, correct/incorrect flash, XP counter roll. Respect `prefers-reduced-motion` and cut all of it when set.

**Mobile first.** Most users are on a phone. Puzzle grids must be thumb-reachable, drag targets at least 44px, and the daily session must work one-handed in portrait.

**Accessibility floor**: WCAG AA contrast on all text, visible keyboard focus rings in `--flag`, full keyboard operation of every puzzle including BlockFit (arrow keys to move a piece, space to place, R to rotate), and screen-reader labels on all controls.

## 8. Writing the copy

Every string in the app is your responsibility and generated-sounding copy will undo the design work.

**Banned vocabulary.** Do not use: delve, seamless, robust, leverage, elevate, empower, unlock, harness, tapestry, realm, journey, landscape, testament, underscore, showcase, foster, pivotal, crucial, meticulous, intricate, vibrant, transformative, unleash, supercharge, game-changer, cutting-edge, holistic, curated, bespoke, dive in, level up your, take it to the next level.

**Banned constructions.**
- "It's not just X, it's Y."
- "Whether you're X or Y, Anchor has you covered."
- Rule-of-three lists used for rhythm rather than because there are exactly three things.
- Rhetorical questions as headings.
- "Picture this" or "Imagine a world where."
- Em dashes as a default connector. Maximum one per screen, and only where a comma genuinely will not do.
- Sentences that all run to the same length. Vary them.

**Voice.** Direct, dry, a little competitive. Talk to a 16-year-old who is good at games and does not want to be patronised. Sentence case everywhere, never Title Case. Be specific and concrete rather than motivational.

Bad: "Embark on your cognitive journey and unlock your true potential!"
Good: "Five puzzles. No help for the first 45 seconds."

Bad: "Great job! You're making excellent progress."
Good: "Four out of five, no hints. Your rotation work is the weak spot."

**Empty and error states.** An empty leaderboard says what to do about it, not that there is nothing here. An error says what broke and what to try. Errors do not apologise.

**Buttons keep their verb.** The button that says "Start session" leads to a screen that confirms "Session started". Do not rename actions between steps.

## 9. Social features

**Leaderboards** at `/leaderboard`, four tabs, all functional:
- Global, all-time, by cognitive score
- Weekly, by XP earned since Monday 00:00 UTC
- School, filtered to the user's school string, showing their rank within it
- Friends, from accepted friendships

Each row: rank, avatar, display name, the ranking metric, and streak. Highlight the current user's row and, if they are outside the visible page, pin their position to the bottom of the list. Paginate at 50. Anyone can opt out of public leaderboards from `/profile`, which removes them from global, weekly, and school but not friends.

**Friends.** Each user gets a 6-character friend code. Add by code, plus pending/accepted request states, and a way to remove a friend.

**Direct challenges.** A user picks a category and difficulty, generates a challenge, and gets a shareable link at `/c/[code]`. Anyone opening it plays the same seeded puzzle set. If they are not signed in, the link shows the challenge and pushes them to sign up, then drops them straight into it. Results page compares both scores and times. Challenges expire after 7 days.

**Sharing.** Generate a share card server-side with `next/og` at `/api/share/[type]/[id]`: a 1080×1080 image on the graph-paper background showing the score, streak, or achievement, with Anchor's wordmark. Then:
- Use the Web Share API where available, with the image as a file so it goes into Instagram Stories and Snapchat properly
- Fall back to explicit buttons for WhatsApp (`https://wa.me/?text=`), X (`https://x.com/intent/tweet`), and copy-link
- TikTok and Instagram have no web share intent, so for those offer "Save image" plus copied caption text, and say that plainly in the UI rather than pretending the button posts for them

Every shared link carries a referral param that credits the sharer with XP when a new user signs up through it.

## 10. Database

Create these tables with RLS enabled on every one. Write the migration as a single SQL file in `supabase/migrations/`.

```
profiles          id (fk auth.users), display_name, avatar_emoji, school, year_group,
                  friend_code (unique), timezone, reminder_time, public_leaderboard (bool),
                  xp, level, streak_current, streak_longest, streak_freezes, last_session_date,
                  cognitive_score, referred_by, created_at

category_ratings  user_id, category (enum), rating, puzzles_seen, correct_count,
                  median_time_ms, updated_at   [pk: user_id + category]

sessions          id, user_id, type (daily|practice|challenge), date, puzzle_seeds (jsonb),
                  status, score, xp_earned, accuracy, hints_used, started_at, completed_at

attempts          id, session_id, user_id, puzzle_type, category, difficulty, seed,
                  correct, time_ms, hints_used, attempts, answer (jsonb), created_at

achievements      id, user_id, achievement_key, unlocked_at   [unique: user_id + key]

friendships       id, requester_id, addressee_id, status, created_at  [unique pair]

challenges        id, code (unique), creator_id, category, difficulty, puzzle_seeds (jsonb),
                  expires_at, created_at

challenge_results id, challenge_id, user_id, score, time_ms, completed_at

hint_cache        id, puzzle_type, seed, tier, hint_text, created_at  [unique: type+seed+tier]
```

RLS rules:
- Users read and write only their own `profiles`, `category_ratings`, `sessions`, `attempts`, `achievements`
- A public read policy exposes only `display_name, avatar_emoji, school, xp, cognitive_score, streak_current` from profiles where `public_leaderboard = true`, via a `leaderboard_view`
- Friendships readable by either party
- Challenges readable by anyone with the code
- `hint_cache` readable by all authenticated users, writable only by the service role

Add indexes on `sessions(user_id, date)`, `attempts(user_id, category)`, `profiles(school)`, `profiles(cognitive_score desc)`, and `challenges(code)`.

Leaderboard queries must hit a materialised view or an indexed view, not a full table scan with a client-side sort.

## 11. Build order

You have roughly an hour. Build in this sequence and commit after each block so there is always a deployable state.

1. Scaffold, Tailwind tokens, fonts, layout shell, design system primitives
2. Supabase schema, RLS, types generated to `lib/database.types.ts`
3. Auth: email, Google, Apple behind flag, middleware, callback, onboarding
4. Puzzle generators and solvers, server-side, with unit tests for each generator's solvability
5. Puzzle UI components, starting with BlockFit since it is the hardest
6. Session flow, scoring, adaptive engine, recap
7. Dashboard
8. Leaderboards and friends
9. Hints and AI feedback routes
10. Challenges and sharing
11. Achievements, polish, error boundaries, loading states

If time runs short, cut in this order: challenges, then the n-back variant of Recall, then the calendar heatmap, then two of the four leaderboard tabs. Do not cut auth, the hint ladder, or the recap, because those are the product.

## 12. Non-negotiables before you call it done

Verify each of these yourself and report the result:

- [ ] `npm run build` passes with zero TypeScript errors and zero ESLint errors
- [ ] A new user can sign up with email, complete onboarding, finish a daily session, and see their dashboard without touching the console
- [ ] Google sign-in completes end to end
- [ ] Apple sign-in code is complete and the flag toggles it cleanly
- [ ] Sign out works and clears the session
- [ ] Every puzzle type is solvable and correctly graded at difficulties 1, 5, and 10
- [ ] BlockFit works with touch on a 390px viewport
- [ ] Refreshing mid-session does not lose progress or reroll puzzles
- [ ] Hint button stays locked for 45 seconds and each tier returns distinct, useful text
- [ ] Recap feedback references the actual puzzles played
- [ ] Streak increments across a simulated day boundary and a freeze is consumed on a miss
- [ ] Leaderboards return real rows and the current user is highlighted
- [ ] Share card image renders at `/api/share/score/[id]`
- [ ] No route throws on a signed-out user
- [ ] Lighthouse accessibility score above 90 on `/today` and `/dashboard`
- [ ] `prefers-reduced-motion` removes all animation
- [ ] No string in the app contains any word from the banned list in §8
- [ ] No purple anywhere, no Inter anywhere, no coloured left borders anywhere

## 13. Environment and deploy

Create `.env.local` and `.env.example` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APPLE_AUTH_ENABLED=false
```

Write `README.md` covering: Supabase project setup, running the migration, configuring the Google and Apple providers with the exact redirect URLs, adding the Vercel env vars, and the deploy command. Include the Apple Developer steps in full even though the flag ships off.

Deploy to Vercel when the checklist in §12 passes. Confirm the production URL loads, sign up on it with a fresh email, and complete one full session before you report back.

## 14. How to work

Ask me questions only if something here genuinely blocks you. Otherwise make the call, note the decision, and keep moving. Show me the design tokens and one puzzle screen for approval before you build the remaining three puzzle types, since that is the cheapest point to correct the visual direction.

When you finish, give me a short summary: what shipped, what was cut, the production URL, and anything I need to configure by hand.
