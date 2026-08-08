# APP-STORE.md — Anchor: iOS Pre-Submission Checklist

Capacitor-wrapped Next.js education app · ages 13–18 · Supabase auth (email/password + Google OAuth) · AI tutor via DeepSeek (Anthropic-compatible API) · no ads, no tracking, no payments.

## 0. Where this codebase already stands

Done and verified in this repo:

- ✅ **In-app account deletion** (5.1.1(v)) — Profile → Settings → Delete account. `/api/account/delete` deletes the auth user; every user table cascades (verified live: zero rows left after deletion). SIWA/Google token revocation still to add when those providers ship.
- ✅ **Privacy policy in-app** (5.1.1(i)) — `/privacy`, public, names Supabase + DeepSeek + Google, the AI data flow, retention and deletion. Linked from the auth screen.
- ✅ **Terms of use** — `/terms` (not required by Apple for a free app, but written for the minors+LLM context).
- ✅ **Support page** (1.5) — `/support` with contact + report-a-player instructions. Use this URL in App Store Connect.
- ✅ **AI consent gate** (5.1.2(i)) — affirmative consent card before the first AI hint/tutor request; hints and tutor are hidden until agreed; grading never uses the AI.
- ✅ Age 13+ statement in the policy; no ads, no tracking SDKs, no ATT anywhere.

Still to build before submission (in priority order):

1. **Sign in with Apple** (4.8) — mandatory because Google OAuth is offered. Supabase has a native Apple provider; the `NEXT_PUBLIC_APPLE_AUTH_ENABLED` flag already exists in the codebase. Equal button prominence with Google. Needs the Apple Developer account.
2. **Capacitor static-export migration** (Section 2) — API routes must move to Supabase Edge Functions.
3. **Block + report in-app** (1.2) — friends/display names are user interaction in a minor-facing app. `/support` reporting is the interim; ship an in-app control before submission.
4. **Offline screen, push (streak reminder), splash, haptics** — the 4.2 native set.
5. On account deletion, also revoke SIWA tokens (REST) and the Google credential once those logins ship.

## 1. Hard requirements (guideline numbers in parentheses)

- [ ] **Sign in with Apple** (4.8). Because we offer Google OAuth, we must offer an equivalent privacy-focused login that limits collection to name/email, allows email hiding, and doesn't profile for ads. Email/password does NOT satisfy this. Supabase supports the Apple provider natively. Button prominence comparable to Google. The 4.8 "education app" exception does not apply — it covers school-issued SSO only.
- [x] **In-app account deletion** (5.1.1(v)). Immediate, permanent, in settings — done (see Section 0).
- [x] **AI consent gate** (5.1.2(i), Nov 2025 update). Done. Also confirm DeepSeek's data-training posture and reflect it in the policy if it changes.
- [x] **Privacy policy accessible inside the app** (5.1.1(i)) — done; keep the App Store Connect URL identical to `/privacy`.
- [ ] **Block and report for social features** (1.2) — in-app control still to ship.
- [ ] **OAuth via system browser, not the WebView** (2.1, 5.1.1(vii)). Google returns `disallowed_useragent` inside embedded WebViews. Use `@capacitor/browser` + the deep-link flow in Section 2.
- [ ] **Native offline handling** (4.2). Branded offline screen with retry — never the WKWebView error page. Test cold start in airplane mode.
- [ ] **3–4 native capabilities** (4.2/4.2.2): push notifications (streak reminders), the offline screen, no browser chrome + persistent login, branded splash, haptics on puzzle completion. SIWA also counts.
- [ ] **`ITSAppUsesNonExemptEncryption = NO`** in Info.plist (standard TLS is exempt under 15 CFR 740.17).
- [ ] **`PrivacyInfo.xcprivacy` privacy manifest** in `ios/App` — Capacitor core + preferences touch required-reason APIs (e.g. `NSPrivacyAccessedAPICategoryUserDefaults`, reason `CA92.1`).
- [ ] **Do NOT add** `NSUserTrackingUsageDescription`/ATT (we don't track — its presence contradicts our labels), no `NSAllowsArbitraryLoads`, no camera/photo usage strings while avatars are emoji-only.

## 2. Architecture decision: Capacitor wrapper

**Decision: static export bundled in the app. No `server.url` in production.**

Pointing the WKWebView at the hosted site is the classic 4.2/4.2.2 rejection ("not sufficiently different from a mobile browsing experience") and brushes against 2.5.2. Bundled assets are the reviewed-safe path; Anchor's substance (attempt-first tutor, streaks, review, friends) is real app functionality — remove the wrapper smell and most of the risk goes with it.

Consequences and config:

- `next.config`: `output: 'export'`. Capacitor config: `{ appId: 'app.anchor.study', appName: 'Anchor', webDir: 'out', ios: { contentInset: 'never' } }`. `server.url` + `cleartext: true` in dev builds only.
- **API routes, SSR and server data-fetching do not ship in a static export.** Move `/api/learn/*`, `/api/session/*`, `/api/account/delete` etc. to Supabase Edge Functions (service key and DeepSeek key stay server-side there — never in the bundle). This is the big migration item.
- **Supabase OAuth in the wrapper** (web redirects break: PKCE verifier lost from cookies):
  1. `signInWithOAuth({ provider, options: { redirectTo: 'https://<domain>/api/auth/native-callback', skipBrowserRedirect: true } })`
  2. Open the returned URL with `@capacitor/browser` (system browser — also satisfies Google's WebView ban)
  3. Hosted endpoint 302s to `anchor://auth-callback?code=...`
  4. Handle `appUrlOpen`, call `exchangeCodeForSession(code)`
  - Dedicated client: `flowType: 'pkce'`, `detectSessionInUrl: false`, localStorage storage. Register the custom scheme + bridge URL in Supabase Auth → Redirect URLs; declare the scheme in `CFBundleURLTypes`.

## 3. App Store Connect setup

**Metadata**
- [ ] Privacy Policy URL — the live `/privacy` (identical content to in-app).
- [ ] Support URL — the live `/support` (1.5).
- [ ] Screenshots: real app on a 6.9" iPhone; no browser UI visible; no marketing splash images (2.3.3).
- [ ] Description/keywords: accurate, no "also on Android", no keyword stuffing (2.3.4/2.3.7). **Never use "for kids"/"for children"** anywhere — prohibited outside the Kids Category (2.3.8/5.1.4).
- [ ] EULA: Apple's standard EULA suffices (no payments → 3.1.2 doesn't apply). `/terms` is extra credit.

**Age rating (2025 questionnaire — mandatory)**
- [ ] Answer honestly: AI chat (the tutor), user interaction (friends), user-generated content (display names/avatars). Expected outcome: **13+**. Do not engineer a lower rating (2.3.6).

**App Privacy nutrition labels** — all **Linked to identity**, purpose **App Functionality**, **Tracking: No**:

| Category | Our data types |
|---|---|
| Contact Info | Email address; Name (display name) |
| Identifiers | User ID (Supabase auth UID) |
| User Content | School name, year group, avatar, free-form answers sent to the LLM |
| Usage Data | Puzzle attempts, scores, streaks, friend connections |

"Collected" = stored off-device — everything in Supabase counts, including data handled by DeepSeek. Labels that don't match real traffic are a rejection/removal ground.

**App Review Information**
- [ ] Demo account with **populated** state (progress, streaks, friends, working AI hints). Empty demo accounts are the single most common 2.1 rejection. (One exists: see the project notes.)
- [ ] Reviewer notes: education app for 13–18; AI tutor is hint-only and consent-gated; deletion lives in Profile → Settings; no ads/tracking/payments.

## 4. Rejection risks, ranked

1. **4.2 "repackaged website"** — the #1 Capacitor rejection. Mitigate with Section 2 + the native set; test cold start in airplane mode.
2. **4.8 Google OAuth without Sign in with Apple** — near-guaranteed rejection as currently specced. Ship SIWA first.
3. **5.1.1(v) account deletion** — done here; keep it discoverable, add provider token revocation when SIWA/Google ship natively.
4. **2.1 broken login/demo in review** — system-browser OAuth + tested, populated demo account.
5. **Privacy label/policy/manifest mismatch** — labels, `/privacy`, `PrivacyInfo.xcprivacy` and real traffic must all tell the same story.
6. **AI tutor probed by the reviewer** — the tutor already refuses off-key requests; also add an off-topic/sensitive-content refusal line to its system prompt; declare AI chat in the questionnaire.
7. **1.2 social without block/report** — ship the in-app control.
8. **2.3 metadata** — screenshot/wording pass before upload.

## 5. Can wait until after first approval

Custom EULA wording, Face ID, widgets, share sheet, richer haptics, avatar photo upload (and its Info.plist strings), iPad layout, GDPR-K per-country consent ages (launch home-market first), moderation dashboards beyond block/report, push-campaign sophistication, any payments (would trigger 3.1.2 + StoreKit).
