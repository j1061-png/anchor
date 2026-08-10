# SUBMIT-GUIDE.md — putting Anchor on the App Store, step by step

The fast-submit track: the native shell loads https://anchor-one-zeta.vercel.app with
native icon/splash/offline/haptics. Everything below assumes the Apple Developer
account is ACTIVE (you get an email; check https://developer.apple.com/account).

## What is already done in this repo

- Native Xcode project: `ios/App/App.xcodeproj` (open with Xcode)
- Bundle ID `app.anchor.study`, display name "Anchor"
- App icon + splash in the asset catalog
- Branded offline screen (never a WebKit error page)
- Haptics on solve, safe-area handling for the notch
- Privacy manifest (`PrivacyInfo.xcprivacy`), export-compliance key set
- In-app: privacy policy, terms, support, account deletion, AI consent gate

## Step 1 — Xcode signing (5 minutes, needs your Apple ID)

1. Open `ios/App/App.xcodeproj` in Xcode
2. Xcode menu → Settings → Accounts → "+" → sign in with the Apple ID that
   has the developer membership
3. Click the "App" target → Signing & Capabilities tab →
   - tick "Automatically manage signing"
   - Team: pick your new team
   Xcode creates the certificates and provisioning profile itself.

## Step 2 — Sign in with Apple (required before review — guideline 4.8)

Because the app offers "Continue with Google", Apple requires its own login too.
1. Xcode → App target → Signing & Capabilities → "+ Capability" → Sign in with Apple
2. Supabase dashboard → Authentication → Sign In / Providers → Apple → enable,
   following https://supabase.com/docs/guides/auth/social-login/auth-apple
3. Set `NEXT_PUBLIC_APPLE_AUTH_ENABLED=true` in Vercel env vars and redeploy —
   the auth screen shows the Apple button automatically.

## Step 3 — App Store Connect record

1. https://appstoreconnect.apple.com → My Apps → "+" → New App
2. Platform iOS · Name "Anchor" · Language English (U.K.) ·
   Bundle ID `app.anchor.study` · SKU `anchor-001`
3. Privacy Policy URL: `https://anchor-one-zeta.vercel.app/privacy`
   Support URL: `https://anchor-one-zeta.vercel.app/support`
4. Age rating questionnaire: answer honestly —
   AI chat: YES (the tutor) · user interaction: YES (friends) ·
   user-generated content: YES (display names) → expect 13+
5. App Privacy labels (Data → "Data Linked to You", purpose App Functionality,
   tracking NO): Email, Name, User ID, Other User Content (school, year group,
   answers sent to the AI), Product Interaction (attempts, scores, streaks)

## Step 4 — Upload the build

1. In Xcode: Product → Destination → "Any iOS Device (arm64)"
2. Product → Archive (takes a few minutes)
3. Organizer window opens → Distribute App → App Store Connect → Upload →
   accept defaults → Upload
4. Wait ~15 min for processing, then in App Store Connect select the build.

## Step 5 — Review information (prevents the #1 rejection)

- Demo account for the reviewer: `demo@anchor.app` / `AnchorDemo2026`
  (already populated with history, streaks and working AI)
- Reviewer notes, paste this:
  > Anchor is a study aid for secondary-school students (13+). Students attempt
  > curriculum problems first; an AI tutor gives Socratic hints only after an
  > attempt, behind an explicit consent screen, and never decides marks —
  > grading is deterministic against verified answer keys. Social features are
  > limited to friend codes and challenges; account deletion is in
  > Profile → Settings. No ads, no tracking, no payments.

## Step 6 — Screenshots

Run the app on the iPhone 17 Pro simulator (or use iPhone mode at
https://anchor-one-zeta.vercel.app/iphone), capture: Today, a Learn problem,
the tutor conversation, Progress. 6.9-inch size (1320 × 2868). No browser UI
visible in shots.

## Step 7 — Submit for review

Add description (see below), keywords, submit. First reviews typically take
24–72 hours.

Suggested description:
> Anchor is a daily study app for students that trains you to think for
> yourself. You attempt real curriculum problems first; an AI tutor guides
> with questions instead of answers. It schedules reviews so learning sticks,
> and tracks how much you solve independently — building skill, memory, and
> confidence without shortcuts.

## If rejected

Most likely reason: guideline 4.2 ("app is a repackaged website"). The answer
is in APP-STORE.md — the full static-export migration. Nothing about a
rejection is final; fix, resubmit, typical turnaround is a day.
