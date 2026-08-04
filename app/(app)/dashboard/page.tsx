import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { AchievementGrid } from "@/components/achievements/grid";
import {
  CategoryBars,
  CategoryRadar,
  ScoreOverTime,
  ScoreSparkline,
} from "@/components/dashboard/charts";
import { CalendarHeatmap } from "@/components/dashboard/heatmap";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since90 = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const since180 = new Date(Date.now() - 180 * 86_400_000).toISOString();

  const [{ data: profile }, { data: ratings }, { data: sessions }, { data: attempts }, { data: unlocked }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("category_ratings").select("*").eq("user_id", user.id),
      supabase
        .from("sessions")
        .select("date, cognitive_score_after, completed_at")
        .eq("user_id", user.id)
        .eq("status", "complete")
        .gte("completed_at", since180)
        .order("completed_at", { ascending: true }),
      supabase
        .from("attempts")
        .select("category, correct, hints_used, time_ms, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since90),
      supabase.from("achievements").select("achievement_key").eq("user_id", user.id),
    ]);

  const rows = attempts ?? [];
  const scorePoints = (sessions ?? [])
    .filter((s) => s.cognitive_score_after !== null)
    .map((s) => ({ date: s.date, score: s.cognitive_score_after! }));

  const total = rows.length;
  const correct = rows.filter((a) => a.correct).length;
  const hintFree = rows.filter((a) => a.hints_used === 0).length;
  const accuracyPct = total ? (correct / total) * 100 : 0;
  const independencePct = total ? (hintFree / total) * 100 : 0;

  // Think time (§6): median seconds before the first hint or answer — the
  // stored time is time-to-answer; on no-hint attempts that is the full
  // think, so the median over those approximates it.
  const noHintTimes = rows
    .filter((a) => a.hints_used === 0)
    .map((a) => a.time_ms)
    .sort((a, b) => a - b);
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
  const strengths = sortedRatings.slice(0, 2);
  const weaknesses = sortedRatings.slice(-2).reverse();

  const heatCounts: Record<string, number> = {};
  for (const a of rows) {
    const day = a.created_at.slice(0, 10);
    heatCounts[day] = (heatCounts[day] ?? 0) + 1;
  }

  const weekAgo = Date.now() - 7 * 86_400_000;
  const weekAgoPoint = scorePoints.filter(
    (p) => new Date(p.date).getTime() <= weekAgo,
  ).at(-1);
  const delta =
    weekAgoPoint !== undefined
      ? (profile?.cognitive_score ?? 0) - weekAgoPoint.score
      : null;

  const unlockedKeys = new Set((unlocked ?? []).map((a) => a.achievement_key));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Dashboard
      </h1>

      {/* Cognitive score hero */}
      <section className="plane flex items-center justify-between p-5">
        <div>
          <p className="num font-display text-5xl font-extrabold">
            {profile?.cognitive_score ?? 0}
          </p>
          <p className="mt-1 text-sm text-slate">
            cognitive score
            {delta !== null && (
              <span
                className="num ml-2"
                style={{ color: delta < 0 ? "var(--flag)" : "var(--ink)" }}
              >
                {delta >= 0 ? "+" : ""}
                {delta} this week
              </span>
            )}
          </p>
        </div>
        <ScoreSparkline points={scorePoints.slice(-14)} />
      </section>

      {/* Accuracy and hint independence: equal billing (§6) */}
      <div className="grid grid-cols-2 gap-4">
        <section className="plane p-4">
          <p className="num font-display text-3xl font-extrabold">
            {Math.round(accuracyPct)}%
          </p>
          <p className="text-sm text-slate">accuracy</p>
          {total > 0 && <CategoryBars rows={perCategory((a) => a.correct)} />}
        </section>
        <section className="plane p-4">
          <p className="num font-display text-3xl font-extrabold">
            {Math.round(independencePct)}%
          </p>
          <p className="text-sm text-slate">solved with no hints</p>
          {total > 0 && (
            <CategoryBars rows={perCategory((a) => a.hints_used === 0)} hue="gold" />
          )}
        </section>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <section className="plane p-4">
          <p className="num font-display text-3xl font-extrabold">
            {thinkTime !== null ? `${thinkTime}s` : "—"}
          </p>
          <p className="text-sm text-slate">median think time</p>
        </section>
        <section className="plane p-4">
          <p className="num font-display text-3xl font-extrabold">
            {profile?.streak_current ?? 0}
          </p>
          <p className="text-sm text-slate">
            day streak · best <span className="num">{profile?.streak_longest ?? 0}</span>
          </p>
        </section>
      </div>

      {/* Radar */}
      <section className="plane p-4">
        <h2 className="text-sm font-semibold">The six categories</h2>
        <CategoryRadar
          ratings={(ratings ?? []).map((r) => ({
            category: r.category,
            rating: r.rating,
          }))}
        />
      </section>

      {/* Score over time */}
      <section className="plane p-4">
        <h2 className="mb-3 text-sm font-semibold">Score over time</h2>
        <ScoreOverTime points={scorePoints} />
      </section>

      {/* Strengths / weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <section className="plane p-4">
          <h2 className="text-sm font-semibold">Strong</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {strengths.map((r) => (
              <li key={r.category} className="flex justify-between">
                <span>{CATEGORY_LABELS[r.category]}</span>
                <span className="num">{r.rating}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="plane p-4">
          <h2 className="text-sm font-semibold">Work on</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {weaknesses.map((r) => (
              <li key={r.category} className="flex justify-between">
                <span>{CATEGORY_LABELS[r.category]}</span>
                <span className="num">{r.rating}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Calendar heatmap */}
      <section className="plane p-4">
        <h2 className="mb-3 text-sm font-semibold">Last 90 days</h2>
        <CalendarHeatmap counts={heatCounts} />
      </section>

      {/* Achievements */}
      <section className="plane p-4">
        <h2 className="mb-3 text-sm font-semibold">Achievements</h2>
        <AchievementGrid defs={ACHIEVEMENTS} unlockedKeys={[...unlockedKeys]} />
      </section>
    </div>
  );
}
