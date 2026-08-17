-- ============================================================================
-- AI consent, stored server-side
--
-- The consent card (App Store guideline 5.1.2(i)) was recorded in localStorage
-- only, and nothing on the server read it: `/api/learn/attempt` sent the
-- student's working to the AI provider on the first incorrect submission
-- whether or not the card had ever been shown. The card hid the hint ladder;
-- it did not stop the request. That made both the card's own copy and the
-- privacy policy false.
--
-- Consent now lives here, on the profile, and every model call in the learn
-- path reads it (see lib/ai-consent.ts). Null means not granted — the default
-- for every existing row, so nobody is opted in by this migration.
-- ============================================================================

alter table public.profiles
  add column if not exists ai_consent_at timestamptz;

comment on column public.profiles.ai_consent_at is
  'When the student agreed to their attempt text being sent to the AI provider '
  '(guideline 5.1.2(i)). Null means no consent: hints, the tutor, the attempt '
  'diagnosis and the written half of the end-of-item feedback are all withheld '
  'and no student text leaves the app. Revoking sets it back to null. '
  'Deterministic grading, the worked solution and XP never read this column.';

-- Written through POST /api/consent with the service role, after the route has
-- verified the caller, exactly like every other server-owned column. The client
-- keeps its read (the "read own profile" policy already covers new columns) so
-- the profile page can render the toggle without a round trip, but it gets no
-- direct write path: an UPDATE grant here would let a client stamp its own
-- consent without ever seeing the card.

-- ---------------------------------------------------------------------------
-- Legacy leaderboard views still gated on public_leaderboard (default TRUE)
-- while the product moved to opt-IN via leaderboard_opt_in (default false).
-- No app code reads them any more, but they were granted to authenticated
-- users, exposing display name, school, XP and streak for people who never
-- opted in. Revoke rather than redefine: nothing depends on them.
-- ---------------------------------------------------------------------------
revoke all on public.leaderboard_view from authenticated, anon;
revoke all on public.weekly_leaderboard from authenticated, anon;
