# Anchor — what's left for you

Everything below needs credentials or accounts only you have. The code for
each is written and building; these are configuration steps.

## 1. Supabase (blocks everything)

Anchor has never talked to a live database — `.env.local` holds placeholders,
so no signup, session, or leaderboard has ever executed against real Postgres.

1. Create the project, copy the three keys into `.env.local` (§1 of README).
2. Run `supabase/migrations/20260804000000_init.sql` (§2).
3. Regenerate types: `npx supabase gen types typescript --project-id <ref> > lib/database.types.ts`
   and re-run `npm run build`. The hand-written types match the migration, but
   generated ones are the source of truth from here on.
4. Sign up with a fresh email and finish onboarding, one session, one recap.

## 2. Google OAuth

README §3. Redirect URI is `https://<project-ref>.supabase.co/auth/v1/callback` —
Supabase's domain, not yours. The button already works once the provider is on.

## 3. Apple OAuth (optional, ships off)

README §4 has the full Developer-account walkthrough. The integration is
written; flipping `NEXT_PUBLIC_APPLE_AUTH_ENABLED=true` is the only repo change.

## 4. Anthropic key

Hints and the recap paragraph fall back to deterministic text without it, so
the app works — but the hint ladder is the product, so add the key.

## 5. Deploy

README §7. Add the same env vars in Vercel, then add your production URL to
Supabase Auth redirect URLs.

## 6. Security scan (unrun)

A HawkScan hook is configured in this environment but the `hawk` CLI, an API
key, and Docker are all absent, so no DAST scan has run against Anchor. If you
want one: install the CLI, `hawk init --browser`, start the app, `hawk scan`.

---

## What was verified without a database

- `npm run build` clean, `npm test` 252 passing, ESLint clean, `bash
  scripts/ship-check.sh` (copy and design bans) clean.
- All four puzzle types played in a browser at 375px through
  `/dev/puzzle?type=…` — generation, drag/tap/keyboard input, grading, and the
  post-answer explanation.
- Middleware guards: `/today`, `/dashboard`, `/leaderboard`, `/profile`,
  `/practice`, `/session/*` all 307 to `/auth?next=…` when signed out.
- Lighthouse accessibility 100 on `/` and `/auth` (the two pages reachable
  without a session).

## What could not be verified without a database

Anything past the signup wall: the daily session lifecycle end to end, streak
rollover across a real day boundary, leaderboard rows, friends, challenges,
share-card rendering, and Lighthouse on `/today` and `/dashboard`. The logic
underneath is unit-tested (Elo, streaks and freezes, generators and graders);
the wiring is not integration-tested.
