import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/streak";
import { PUZZLE_LABELS, type SessionSlot } from "@/lib/types";
import { BlockMeter } from "@/components/ui/think-timer";
import { StartSessionButton } from "./start-button";
import { MidnightCountdown } from "./countdown";
import { ChallengeCta } from "@/components/share/challenge-cta";
import { ProgressShare } from "@/components/progress/xp-timeline";
import Link from "next/link";

export const metadata = { title: "Train" };

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, timezone, streak_current, streak_freezes, display_name, friend_code, xp, level")
    .eq("id", user.id)
    .single();
  const today = localDate(profile?.timezone ?? "UTC");

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status, puzzle_seeds, xp_earned, feedback, accuracy")
    .eq("user_id", user.id)
    .eq("type", "daily")
    .eq("date", today)
    .maybeSingle();

  const { count: answered } = session
    ? await supabase
        .from("attempts")
        .select("id", { count: "exact", head: true })
        .eq("session_id", session.id)
    : { count: 0 };

  const firstName = profile?.display_name?.split(" ")[0] ?? "you";

  if (!session) {
    return (
      <div className="flex flex-col gap-8">
        <header className="page-header deal-in">
          <span className="principle-tag">Attempt before AI</span>
          <h1 className="page-title">Today&apos;s five</h1>
          <p className="page-subtitle">
            Five puzzles picked for where you&apos;re weakest, {firstName}. No help
            for the first 45 seconds — the struggle is the mechanism.
          </p>
        </header>

        <section className="plane-interactive p-8 deal-in stagger-1">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="num font-display text-5xl font-extrabold">5</p>
              <p className="mt-1 text-slate">puzzles · ~10 minutes · brain-only first</p>
            </div>
            <StartSessionButton label="Start today's session" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <StreakCard
            streak={profile?.streak_current ?? 0}
            freezes={profile?.streak_freezes ?? 0}
          />
          <ChallengeCta friendCode={profile?.friend_code} />
        </div>
      </div>
    );
  }

  if (session.status === "in_progress") {
    const slots = session.puzzle_seeds as SessionSlot[];
    return (
      <div className="flex flex-col gap-8">
        <header className="page-header">
          <span className="principle-tag">In progress</span>
          <h1 className="page-title">Session started</h1>
          <p className="page-subtitle">
            <span className="num font-semibold text-ink">{answered ?? 0}/5</span> answered.
            The clock only runs while a puzzle is open.
          </p>
        </header>

        <section className="plane p-6">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((s, i) => (
              <li
                key={i}
                className={`plane-sm flex items-center justify-between px-4 py-3 text-sm ${
                  i < (answered ?? 0) ? "opacity-50" : ""
                }`}
              >
                <span className="font-semibold">{PUZZLE_LABELS[s.type]}</span>
                {i < (answered ?? 0) && (
                  <span className="text-xs text-success">Done</span>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <StartSessionButton label="Continue session" sessionId={session.id} />
          </div>
        </section>

        <StreakCard
          streak={profile?.streak_current ?? 0}
          freezes={profile?.streak_freezes ?? 0}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="page-header deal-in">
        <span className="principle-tag">Done for today</span>
        <h1 className="page-title">Session complete</h1>
        <p className="page-subtitle">
          <span className="num font-semibold text-ink">
            {Math.round((session.accuracy ?? 0) * 5)}/5
          </span>{" "}
          solved · <span className="num font-semibold text-ink">{session.xp_earned}</span> XP
          for independent thinking
        </p>
      </header>

      {session.feedback && (
        <section className="plane border-l-4 border-l-accent p-6 deal-in">
          <p className="text-sm leading-relaxed">{session.feedback}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-4">
        <Link
          href={`/session/${session.id}`}
          className="inline-flex items-center rounded-(--radius-pill) bg-accent px-6 py-3 text-sm font-semibold text-chalk hover:bg-accent/90"
        >
          View full recap & share
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="plane p-6">
          <p className="text-sm text-slate">Tomorrow&apos;s five unlocks in</p>
          <MidnightCountdown />
        </section>
        <StreakCard
          streak={profile?.streak_current ?? 0}
          freezes={profile?.streak_freezes ?? 0}
        />
      </div>

      {profile && (
        <ProgressShare
          userId={profile.id}
          friendCode={profile.friend_code}
          streak={profile.streak_current}
          level={profile.level}
          xp={profile.xp}
        />
      )}

      <ChallengeCta friendCode={profile?.friend_code} />
    </div>
  );
}

function StreakCard({ streak, freezes }: { streak: number; freezes: number }) {
  return (
    <section className="plane flex items-center justify-between p-6">
      <div>
        <p className="num font-display text-4xl font-extrabold">{streak}</p>
        <p className="mt-1 text-sm text-slate">
          Recall days — attempts, not opens
          {freezes > 0 && (
            <>
              {" · "}
              <span className="num">{freezes}</span> freeze{freezes === 1 ? "" : "s"}
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-slate">
          Showing up isn&apos;t rewarded. Doing the thinking is.
        </p>
      </div>
      <BlockMeter
        filled={Math.min(16, streak)}
        size="md"
        label={`${streak} days of recall practice`}
      />
    </section>
  );
}
