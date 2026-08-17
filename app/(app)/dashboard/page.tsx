import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { AchievementProgress } from "@/lib/achievement-meta";
import { AchievementGrid } from "@/components/achievements/grid";
import { CategoryBars, CategoryRadar } from "@/components/dashboard/charts";
import { CalendarHeatmap } from "@/components/dashboard/heatmap";
import { ProxyNote } from "@/components/research/proxy-note";
import { PROGRESS_TABS } from "@/components/progress/tabs";
import { SegmentedNav } from "@/components/ui/segmented";
import { Page, PageHeader, Section } from "@/components/ui/page";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { WhyThis } from "@/components/ui/why-this";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

export const metadata = { title: "Skill ratings" };

const WINDOW_DAYS = 90;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = Date.now();
  const todayUtc = new Date(now).toISOString().slice(0, 10);
  const since90 = new Date(now - WINDOW_DAYS * 86_400_000).toISOString();

  const [
    { data: ratings },
    { data: attempts },
    { data: unlocked },
    { data: profile },
    { count: solvedLifetime },
    { count: sessionsFinished },
  ] = await Promise.all([
    supabase.from("category_ratings").select("*").eq("user_id", user.id),
    supabase
      .from("attempts")
      .select("category, correct, hints_used, time_ms, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since90),
    // The row id, not just the key: it is what the achievement card renders
    // from, so without it a milestone cannot be shared. And unlocked_at, so a
    // tile can say when it landed instead of throwing the date away.
    supabase
      .from("achievements")
      .select("id, achievement_key, unlocked_at")
      .eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("friend_code, leaderboard_opt_in, streak_current, streak_longest")
      .eq("id", user.id)
      .maybeSingle(),
    // Lifetime counters, head-only, so locked achievement tiles can show how
    // far along they are rather than an unexplained dashed box.
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("correct", true),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "complete"),
  ]);

  const rows = attempts ?? [];

  // The two headline dimensions, shown with their sample sizes (Feature F/G):
  // never a single composite (R1). Unaided = solved without any hint.
  const total = rows.length;
  const unaided = rows.filter((a) => a.hints_used === 0);
  const unaidedCorrect = unaided.filter((a) => a.correct).length;
  const unaidedAccuracy = unaided.length
    ? Math.round((unaidedCorrect / unaided.length) * 100)
    : null;
  const withHints = rows.filter((a) => a.hints_used > 0).length;
  const hintReliance = total ? Math.round((withHints / total) * 100) : null;

  const accuracyPct = total
    ? Math.round((rows.filter((a) => a.correct).length / total) * 100)
    : null;

  const noHintTimes = unaided.map((a) => a.time_ms).sort((a, b) => a - b);
  const thinkTime = noHintTimes.length
    ? Math.round(noHintTimes[Math.floor(noHintTimes.length / 2)] / 1000)
    : null;

  const perCategory = (predicate: (a: (typeof rows)[number]) => boolean) => {
    const byCat = new Map<Category, { hit: number; total: number }>();
    for (const a of rows) {
      const e = byCat.get(a.category) ?? { hit: 0, total: 0 };
      e.total += 1;
      if (predicate(a)) e.hit += 1;
      byCat.set(a.category, e);
    }
    return [...byCat.entries()].map(([category, e]) => ({
      category,
      value: e.total ? (e.hit / e.total) * 100 : 0,
    }));
  };

  const sortedRatings = [...(ratings ?? [])].sort((a, b) => b.rating - a.rating);
  // slice(0,2) and slice(-2) overlap below four rows, which printed the SAME
  // category as both "Strong" and "Work on". Take at most half the list from
  // each end so the two can never name the same thing.
  const take = Math.min(2, Math.floor(sortedRatings.length / 2));
  const strengths = take > 0 ? sortedRatings.slice(0, take) : [];
  const weaknesses = take > 0 ? sortedRatings.slice(-take).reverse() : [];

  const heatCounts: Record<string, number> = {};
  for (const a of rows) {
    const day = a.created_at.slice(0, 10);
    heatCounts[day] = (heatCounts[day] ?? 0) + 1;
  }

  const earnedAchievements = (unlocked ?? []).map((a) => ({
    key: a.achievement_key,
    id: a.id,
    at: (a as { unlocked_at?: string | null }).unlocked_at ?? null,
  }));

  const ratingValues = (ratings ?? []).map((r) => r.rating);
  const achievementProgress: AchievementProgress = {
    sessions: sessionsFinished ?? 0,
    solved: solvedLifetime ?? 0,
    streak: Math.max(
      profile?.streak_current ?? 0,
      profile?.streak_longest ?? 0,
    ),
    bestRating: ratingValues.length > 0 ? Math.max(...ratingValues) : 0,
    categoriesAt1400: ratingValues.filter((r) => r >= 1400).length,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <Page width="wide">
      <SegmentedNav items={PROGRESS_TABS} />

      <PageHeader
        eyebrow="Progress"
        title="Skill ratings"
        lead={
          <>
            Six skills rated separately over the last{" "}
            <span className="num">{WINDOW_DAYS}</span> days. There is no combined
            number here, and there never will be — a score that mixes accuracy,
            speed, hints and memory measures nothing real.
          </>
        }
        action={
          <Link
            href="/independence"
            className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
          >
            Independence profile
            <Icon name="arrowRight" size={15} />
          </Link>
        }
      />

      {/* --- The headline counts, each with its sample size ---------------- */}
      <StatGrid>
        <Stat
          label="Solved yourself"
          value={unaidedAccuracy === null ? "—" : unaidedAccuracy}
          unit={unaidedAccuracy === null ? undefined : "%"}
          icon="brainOnly"
          tone={unaidedAccuracy === null ? "default" : "green"}
          hint={
            unaided.length > 0 ? (
              <>
                <span className="num">
                  {unaidedCorrect}/{unaided.length}
                </span>{" "}
                items answered with no hint and no worked solution. Not a test
                score.
              </>
            ) : (
              "No hint-free items yet. Finish a set without opening a hint and this fills in."
            )
          }
        />
        <Stat
          label="Needed a hint"
          value={hintReliance === null ? "—" : hintReliance}
          unit={hintReliance === null ? undefined : "%"}
          icon="info"
          tone={hintReliance === null ? "default" : "gold"}
          hint={
            total > 0 ? (
              <>
                <span className="num">
                  {withHints}/{total}
                </span>{" "}
                items where you opened at least one hint. High is not bad; it is
                what the gap on the independence page is measured from.
              </>
            ) : (
              "Nothing counted yet."
            )
          }
        />
        <Stat
          label="Accuracy, all in"
          value={accuracyPct === null ? "—" : accuracyPct}
          unit={accuracyPct === null ? undefined : "%"}
          icon="target"
          hint={
            total > 0 ? (
              <>
                Every item, hinted or not, out of{" "}
                <span className="num">{total}</span>. Kept separate from the
                unaided figure on purpose.
              </>
            ) : (
              "Nothing counted yet."
            )
          }
        />
        <Stat
          label="Think time"
          value={thinkTime === null ? "—" : thinkTime}
          unit={thinkTime === null ? undefined : "s"}
          icon="clock"
          hint={
            thinkTime === null ? (
              "No unaided items timed yet."
            ) : (
              <>
                Median time on the{" "}
                <span className="num">{noHintTimes.length}</span> unaided items.
                Slower is not worse — it is often the work happening.
              </>
            )
          }
        />
      </StatGrid>

      <ProxyNote variant="block" className="mt-4">
        These are counts of what you did in Anchor over the last{" "}
        {WINDOW_DAYS} days. They move as you play, and small samples wobble.
      </ProxyNote>

      {/* --- Where the two dimensions land, category by category ----------- */}
      <Section
        title="By category"
        description="The same two measures broken out per skill, so a weak spot is visible instead of averaged away."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Solved without a hint</CardTitle>
              <CardDescription>
                Share of items in each category you got right with no help at
                all.
              </CardDescription>
            </CardHeader>
            {unaided.length > 0 ? (
              <CategoryBars
                rows={perCategory((a) => a.hints_used === 0 && a.correct)}
                tone="green"
              />
            ) : (
              <p className="text-sm text-text-2">
                Nothing unaided in this window yet.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opened a hint</CardTitle>
              <CardDescription>
                Share of items in each category where you asked for help.
              </CardDescription>
            </CardHeader>
            {total > 0 ? (
              <CategoryBars
                rows={perCategory((a) => a.hints_used > 0)}
                tone="amber"
              />
            ) : (
              <p className="text-sm text-text-2">Nothing counted yet.</p>
            )}
          </Card>
        </div>
      </Section>

      {/* --- Six ratings, never combined ---------------------------------- */}
      <Section
        title="Six skills, rated separately"
        description="Each category carries its own chess-style rating. They are shown side by side because averaging them would invent a number no evidence supports."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CategoryRadar
              ratings={(ratings ?? []).map((r) => ({
                category: r.category,
                rating: r.rating,
              }))}
            />
            <ProxyNote className="mt-2">
              Each skill has its own rating. There is no combined number.
            </ProxyNote>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <RatingList
              title="Strong"
              tone="green"
              rows={strengths}
              empty="Play across a few categories and the strongest ones show up here."
            />
            <RatingList
              title="Work on"
              tone="brand"
              rows={weaknesses}
              empty="Nothing to single out yet — you need ratings in at least two categories."
            />
          </div>
        </div>
      </Section>

      {/* --- Activity ------------------------------------------------------ */}
      <Section
        title={`Last ${WINDOW_DAYS} days`}
        description="One cell per day, counting puzzles finished. Days are UTC, the same clock the counts are stored on."
      >
        <Card>
          <CalendarHeatmap
            counts={heatCounts}
            days={WINDOW_DAYS}
            today={todayUtc}
          />
        </Card>
      </Section>

      {/* --- Achievements. Each earned one can be shared on its own card. --- */}
      <Section
        title="Achievements"
        description="Grouped by what they measure. Locked ones say exactly what would earn them."
      >
        <AchievementGrid
          defs={ACHIEVEMENTS}
          earned={earnedAchievements}
          progress={achievementProgress}
          share={{
            optedIn: profile?.leaderboard_opt_in ?? false,
            friendCode: profile?.friend_code ?? undefined,
            siteUrl,
          }}
        />
        <WhyThis k="unaidedXp" className="mt-8" />
      </Section>
    </Page>
  );
}

function RatingList({
  title,
  tone,
  rows,
  empty,
}: {
  title: string;
  tone: "green" | "brand";
  rows: { category: Category; rating: number }[];
  empty: string;
}) {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-3">
        <h3 className="t-eyebrow">{title}</h3>
        <Badge tone={tone === "green" ? "green" : "brand"}>
          {rows.length > 0 ? `${rows.length}` : "—"}
        </Badge>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-text-2">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((r) => (
            <li
              key={r.category}
              className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] pb-2 text-sm last:border-0 last:pb-0"
            >
              <span className="min-w-0 truncate">
                {CATEGORY_LABELS[r.category]}
              </span>
              <span className="num shrink-0 font-semibold">{r.rating}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
