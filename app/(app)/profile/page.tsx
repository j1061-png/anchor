import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { IdentityCard } from "./identity-card";
import { FriendCodeCard } from "./friend-code-card";
import { FriendsCard } from "./friends-card";
import { SettingsCard } from "./settings-card";
import { ChallengeCta } from "@/components/share/challenge-cta";
import { ShareProgressCard } from "@/components/share/share-progress-card";
import { loadProgressStats } from "@/lib/share-stats";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware guards this

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, avatar_emoji, school, year_group, friend_code, timezone, reminder_time, public_leaderboard, leaderboard_opt_in, ai_consent_at, xp, level, streak_current, streak_longest, created_at",
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <section className="plane p-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Profile didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-slate">
          The profile row didn&apos;t come back. Refresh, or sign in again.
        </p>
      </section>
    );
  }

  const memberSince = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(profile.created_at));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const shareUrl = `${siteUrl}/auth?mode=signup&ref=${profile.friend_code}`;

  // The share card is gated on the opt-IN column, the same one the public
  // image route enforces — never on public_leaderboard, which defaults true.
  const optedIn = profile.leaderboard_opt_in ?? false;

  // brain_only_sessions is not in the generated types yet, so the counts run
  // through an untyped view of the same user-scoped client.
  const db = supabase as unknown as SupabaseClient;
  const [weekStats, allStats] = await Promise.all([
    loadProgressStats(db, user.id, "week", profile.streak_current),
    loadProgressStats(db, user.id, "all", profile.streak_current),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Profile</h1>

      <IdentityCard
        userId={user.id}
        displayName={profile.display_name ?? "Player"}
        avatarEmoji={profile.avatar_emoji}
        school={profile.school}
        yearGroup={profile.year_group}
        level={profile.level}
        xp={profile.xp}
        streakCurrent={profile.streak_current}
        streakLongest={profile.streak_longest}
        memberSince={memberSince}
        share={{
          optedIn,
          friendCode: profile.friend_code,
          siteUrl,
        }}
      />

      <ShareProgressCard
        userId={user.id}
        displayName={profile.display_name ?? "Player"}
        stats={{ week: weekStats, all: allStats }}
        optedIn={optedIn}
        friendCode={profile.friend_code}
        siteUrl={siteUrl}
      />

      <FriendCodeCard code={profile.friend_code} shareUrl={shareUrl} />

      <ChallengeCta friendCode={profile.friend_code} />

      <FriendsCard />

      <SettingsCard
        userId={user.id}
        leaderboardOptIn={profile.leaderboard_opt_in ?? false}
        reminderTime={profile.reminder_time?.slice(0, 5) ?? null}
        timezone={profile.timezone}
        aiConsentAt={profile.ai_consent_at ?? null}
      />

      <form action={signOutAction} className="self-start">
        <Button type="submit" variant="secondary" className="min-h-11">
          Sign out
        </Button>
      </form>

      {/* Policy links must be reachable inside the app (5.1.1(i)), not just
          from the signed-out auth screen. */}
      <footer className="flex gap-4 pb-2 text-xs text-slate">
        <Link className="underline" href="/privacy">
          Privacy policy
        </Link>
        <Link className="underline" href="/terms">
          Terms of use
        </Link>
        <Link className="underline" href="/support">
          Support
        </Link>
      </footer>
    </div>
  );
}
