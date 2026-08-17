import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { loadTimeline } from "@/lib/progress-data";
import { loadProgressStats } from "@/lib/share-stats";
import { ShareInline } from "@/components/share/share-inline";
import { ShareProgressCard } from "@/components/share/share-progress-card";
import { Page, PageHeader, Section } from "@/components/ui/page";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress";
import { WhyThis } from "@/components/ui/why-this";
import { PROGRESS_TABS } from "@/components/progress/tabs";
import { SegmentedNav } from "@/components/ui/segmented";
import { XpBreakdownList, XpTimeline } from "@/components/progress/xp-timeline";
import { Milestones } from "@/components/progress/milestones";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "xp, created_at, streak_current, streak_longest, display_name, friend_code, leaderboard_opt_in",
    )
    .eq("id", user.id)
    .maybeSingle();

  const streakCurrent = profile?.streak_current ?? 0;

  // brain_only_sessions is not in the generated types yet, so the share counts
  // run through an untyped view of the same user-scoped client.
  const db = supabase as unknown as SupabaseClient;
  const [data, shareWeek, shareAll] = await Promise.all([
    loadTimeline(
      user.id,
      Number(profile?.xp ?? 0),
      String(profile?.created_at ?? new Date().toISOString()),
    ),
    loadProgressStats(db, user.id, "week", streakCurrent),
    loadProgressStats(db, user.id, "all", streakCurrent),
  ]);

  const achievements = data.milestones.filter((m) => m.kind === "achievement");
  const earnedThisWeek = data.days.slice(-7).reduce((s, d) => s + d.xp, 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <Page width="full">
      <PageHeader
        eyebrow="Progress"
        title="Your climb so far"
        lead="XP here is not a score for finishing. It is weighted towards the work you did without help, so the shape of this curve is the shape of your independence."
      />

      <SegmentedNav items={PROGRESS_TABS} />

      {/* --- Level + headline numbers ------------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card className="flex items-center gap-5">
          <ProgressRing
            value={data.fraction}
            size={104}
            stroke={9}
            label={`Level ${data.level}, ${Math.round(data.fraction * 100)} percent to level ${data.level + 1}`}
          >
            <div className="text-center">
              <p className="t-eyebrow">Level</p>
              <p className="num text-3xl leading-none">{data.level}</p>
            </div>
          </ProgressRing>
          <div className="min-w-0">
            <p className="num text-2xl leading-none">
              {data.totalXp.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-text-3">XP</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-2">
              {data.needed > 0 ? (
                <>
                  <span className="num font-semibold text-text">
                    {data.needed.toLocaleString()}
                  </span>{" "}
                  more to reach level {data.level + 1}.
                </>
              ) : (
                "Next level reached."
              )}
            </p>
            <p className="num mt-1 text-xs text-text-3">
              +{earnedThisWeek.toLocaleString()} in the last 7 days
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Icon name="flame" size={15} className="text-text-3" />
              <p className="t-eyebrow">Retrieval days</p>
            </div>
            <p className="num mt-3 text-[1.75rem] leading-none">
              {streakCurrent}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-text-3">
              In a row. Counts days you tried to recall something, not days you
              opened the app.
            </p>
            {streakCurrent > 0 && (
              <ShareInline
                className="-ml-2 mt-2"
                label="Share your retrieval-days card"
                title="Anchor"
                text={`${streakCurrent} ${
                  streakCurrent === 1 ? "day" : "days"
                } of recall practice on Anchor.`}
                url={`${siteUrl}/auth?mode=signup`}
                imageUrl={`/api/share/streak/${user.id}`}
                friendCode={profile?.friend_code}
                optedIn={profile?.leaderboard_opt_in ?? false}
              />
            )}
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Icon name="trophy" size={15} className="text-text-3" />
              <p className="t-eyebrow">Milestones</p>
            </div>
            <p className="num mt-3 text-[1.75rem] leading-none">
              {achievements.length}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-text-3">
              Earned so far. Each one is dated on the timeline.
            </p>
          </Card>

          <Card className="col-span-2 flex flex-col justify-between sm:col-span-1">
            <div className="flex items-center gap-2">
              <Icon name="today" size={15} className="text-text-3" />
              <p className="t-eyebrow">Longest run</p>
            </div>
            <p className="num mt-3 text-[1.75rem] leading-none">
              {profile?.streak_longest ?? 0}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-text-3">
              Your best streak of consecutive retrieval days.
            </p>
          </Card>
        </div>
      </div>

      {/* --- The timeline ------------------------------------------------ */}
      <Section
        title="XP over time"
        description="Every point you have earned, when you earned it, and what you were doing."
      >
        <XpTimeline data={data} />
        <WhyThis k="unaidedXp" className="mt-3" />
      </Section>

      {/* --- Where it came from + milestones ----------------------------- */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="t-section mb-1.5">Where your XP came from</h2>
          <p className="mb-4 max-w-[52ch] text-sm leading-relaxed text-text-2">
            Finishing earns nothing here. These are the things that actually
            scored.
          </p>
          <XpBreakdownList data={data} />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="t-section mb-1.5">Milestones</h2>
              <p className="max-w-[52ch] text-sm leading-relaxed text-text-2">
                Levels and achievements, in the order you reached them.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 text-sm font-semibold text-text-2 underline decoration-dotted underline-offset-4 hover:text-text"
            >
              All achievements
            </Link>
          </div>
          <Milestones milestones={data.milestones} />
        </section>
      </div>

      {/* --- Sharing ------------------------------------------------------
          Leads with unaided work rather than a score, per lib/why.ts →
          `sharing`. Gated on the same opt-in the public image route checks. */}
      <Section
        title="Show someone"
        description="A square card of the work you did without help. Nothing leaves this page until you send it."
      >
        <ShareProgressCard
          className="max-w-2xl"
          userId={user.id}
          displayName={profile?.display_name ?? "Player"}
          stats={{ week: shareWeek, all: shareAll }}
          optedIn={profile?.leaderboard_opt_in ?? false}
          friendCode={profile?.friend_code}
          siteUrl={siteUrl}
        />
      </Section>
    </Page>
  );
}
