# Anchor

Daily cognitive training that fights cognitive offloading. Five puzzles a day,
no help for the first 45 seconds.

Stack: Next.js 15 (App Router, TS strict), Tailwind v4, Supabase (Postgres +
Auth + RLS), Anthropic API (`claude-sonnet-4-6`, server routes only),
Recharts, Zod. Deploys to Vercel.

## 1. Supabase project setup

1. Create a project at [database.new](https://database.new). Note the project
   ref (the subdomain of your project URL).
2. From **Project settings → API** copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never
     exposed to the client)
3. **Auth → URL configuration**: set Site URL to your production URL, and add
   redirect URLs:
   - `http://localhost:5730/auth/callback` (dev)
   - `https://<your-domain>/auth/callback` (prod)
4. **Auth → Providers → Email**: leave "Confirm email" on. The app shows a
   real "check your inbox" state after signup.

## 2. Run the migration

Single file: `supabase/migrations/20260804000000_init.sql`. Two options:

- Dashboard: SQL editor → paste the file → run.
- CLI:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

Everything is in that one file: tables, RLS policies, the new-user trigger
(profile + friend code + rating rows + referral credit), `leaderboard_view`,
the `weekly_xp_mv` materialised view with its opt-out-respecting
`weekly_leaderboard` wrapper, and the `lookup_friend_code`,
`refresh_weekly_xp`, `record_hint` and `apply_attempt` functions.

Two things the migration deliberately does that are easy to undo by accident:

- Clients have **no write path** to `challenges`, `sessions`, `attempts`,
  `category_ratings`, `achievements` or `challenge_results`. Those rows carry
  the puzzle seeds and scores, so only the service role writes them. If you
  regenerate policies, keep the `revoke` statements.
- `record_hint` and `apply_attempt` do their increments in SQL. They exist so
  two puzzles submitted at once cannot lose an XP or rating update and so a
  session completes exactly once; do not replace them with read-modify-write
  in the route.

After running it you can regenerate `lib/database.types.ts`:

```bash
npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
```

## 3. Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   create an OAuth client ID (type: Web application).
2. Authorised redirect URI — exactly:
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. In Supabase **Auth → Providers → Google**: enable, paste client ID and
   secret.

No app code changes needed; the button already works once the provider is on.

## 4. Apple OAuth (shipped behind a flag)

The full Sign in with Apple integration is in the codebase. It renders only
when `NEXT_PUBLIC_APPLE_AUTH_ENABLED=true`, so the deploy works before Apple
is provisioned. To provision:

1. Paid [Apple Developer](https://developer.apple.com) account required.
2. **Certificates, Identifiers & Profiles → Identifiers**: create an App ID
   (e.g. `com.yourdomain.anchor`) with the "Sign In with Apple" capability.
3. Create a **Services ID** (e.g. `com.yourdomain.anchor.web`). Enable Sign
   In with Apple on it, configure:
   - Domains: `<project-ref>.supabase.co`
   - Return URLs: `https://<project-ref>.supabase.co/auth/v1/callback`
4. **Keys**: create a key with "Sign In with Apple" enabled, download the
   `.p8` file (one download only), note the Key ID and your Team ID.
5. In Supabase **Auth → Providers → Apple**: enable, set the Services ID as
   the client ID, and generate the client secret from the `.p8` key, Key ID
   and Team ID (Supabase docs include a generator; Apple client secrets
   expire, rotate at most every 6 months).
6. Domain verification happens against the `supabase.co` return URL domain,
   so no extra DNS work is needed in this repo.
7. Flip `NEXT_PUBLIC_APPLE_AUTH_ENABLED=true` in Vercel and redeploy. That is
   the only step in this repo.

## 5. Anthropic API

Create a key at [platform.claude.com](https://platform.claude.com) →
`ANTHROPIC_API_KEY`. Used server-side for hint generation (cached in
`hint_cache` by puzzle type + seed + tier) and the session recap paragraph.
Without a key the app still runs: hints and recaps fall back to deterministic
text derived from the puzzle data.

## 6. Local dev

```bash
npm install
cp .env.example .env.local   # fill in the values above
npm run dev
npm test                     # generator + streak unit tests
npm run build                # must pass clean before deploy
```

`NEXT_PUBLIC_SITE_URL` is `http://localhost:5730` in dev (or whatever port
you run on), your production URL in prod.

## 7. Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel (framework auto-detected).
2. Add env vars (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-domain>`
   - `NEXT_PUBLIC_APPLE_AUTH_ENABLED` = `false` until §4 is done
3. Deploy:

```bash
npx vercel --prod
```

4. Add the production callback URL to Supabase Auth URL configuration (§1.3).
   The Google OAuth redirect URI stays the same — it points at Supabase, not
   your domain.
