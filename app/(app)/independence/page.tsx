import Link from "next/link";
import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  MIN_SAMPLE,
  assistedUnaidedGap,
  buildProfile,
  trend,
  type IndependenceDailyRow,
} from "@/lib/research/independence";
import {
  calibrationCurve,
  calibrationError,
  calibrationVerdict,
  type CalibrationPoint,
} from "@/lib/research/calibration";
import type { Dimension } from "@/lib/research/types";
import { CalibrationChart } from "@/components/research/calibration-chart";
import { DimensionCard } from "@/components/research/dimension-card";
import { ProxyNote } from "@/components/research/proxy-note";
import { PROGRESS_TABS } from "@/components/progress/tabs";
import { SegmentedNav } from "@/components/ui/segmented";
import { Page, PageHeader, Section } from "@/components/ui/page";
import { Card, Well } from "@/components/ui/card";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Icon } from "@/components/ui/icon";
import { WhyThis } from "@/components/ui/why-this";
import { RangeTabs } from "./range-tabs";
import { parseWindow, previousPhrase, windowPhrase } from "./window";

// Feature F (independence profile, F1–F6), Feature G (dependency dashboard,
// G1–G4) and the Feature H calibration view (H3).
//
// Everything on this page is a count of what happened inside Anchor, computed
// deterministically in lib/research (F6). There is no model in the loop and no
// composite figure anywhere — six dimensions, each with its own sample size and
// its own interval, plus the assisted−unaided gap on its own (R1, F1, F5).
//
// Tone is fixed by G3: state the number, attach the definition, offer a next
// action, and never dress a figure up as a verdict on the student.
//
// Layout rule: the DATA leads. The page used to open with two justification
// essays before a single number appeared. The reasoning is all still here —
// every caveat, every interval, every sample-size floor — but it sits in
// disclosures beside the figures it qualifies rather than in front of them.

export const metadata = { title: "Independence" };

const DAY_MS = 86_400_000;

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Midnight UTC of an ISO day string, so windows can be walked backwards. */
const dayStart = (day: string) => Date.parse(`${day}T00:00:00.000Z`);

function Num({ children }: { children: ReactNode }) {
  return <span className="num">{children}</span>;
}

/** Collapsed reasoning. Open it and the full argument is there, unabridged. */
function Disclosure({
  summary,
  children,
  className = "",
}: {
  summary: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={`group rounded-[var(--r-md)] border border-[var(--line)] bg-surface ${className}`}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <Icon
          name="chevronDown"
          size={15}
          className="shrink-0 text-text-3 transition-transform duration-200 group-open:rotate-180"
        />
        {summary}
      </summary>
      <div className="border-t border-[var(--line)] px-4 py-4">{children}</div>
    </details>
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// One neutral thing that would add to each dimension. Task-focused, never about
// the student (I1), and phrased as an option rather than a correction (G3).
const NEXT_ACTION: Record<Dimension["key"], string> = {
  unaided_accuracy:
    "Finish a set without opening a hint. Those are the items counted here.",
  hint_reliance:
    "Take the first attempt before you open a hint. The gap above tells you whether the hints are doing the work.",
  persistence:
    "When an item stalls, write one line about what you tried before you move on.",
  delayed_retention:
    "Reviews come back a day or more after you first met the item. Clearing them on the day they fall due is what this counts.",
  transfer:
    "Transfer items put a strategy you already have into a context you have not seen. Ask for a transfer set when you want more of them.",
  calibration:
    "State a number before you answer, not after. That rating is the only input this uses.",
};

interface CalibrationAttemptRow {
  confidence_before: number | null;
  outcome: string | null;
  completed_at: string | null;
}

export default async function IndependencePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware guards this

  const days = parseWindow((await searchParams).days);

  // lib/database.types.ts was written against the first migration and does not
  // carry the research tables yet, so this page reads through an untyped client
  // and states the row shapes itself. Both tables are behind a "read own rows"
  // policy, so the user-scoped client is the right one.
  const db = supabase as unknown as SupabaseClient;

  const now = Date.now();
  const today = isoDay(now);
  const fetchStart = isoDay(now - (days * 2 - 1) * DAY_MS);

  const [daily, rated] = await Promise.all([
    db
      .from("independence_daily")
      .select("*")
      .eq("user_id", user.id)
      .gte("day", fetchStart)
      .order("day", { ascending: true }),
    db
      .from("item_attempts")
      .select("confidence_before, outcome, completed_at")
      .eq("user_id", user.id)
      .not("confidence_before", "is", null)
      .not("outcome", "is", null)
      .gte("completed_at", `${fetchStart}T00:00:00.000Z`)
      .limit(1000),
  ]);

  const rows: IndependenceDailyRow[] = daily.data ?? [];
  const profile = buildProfile(rows, days);

  // buildProfile anchors its window on the most recent day with data, so the
  // page splits the same way. Anchoring on today instead would put the profile
  // and everything computed here on different windows after a quiet week.
  const anchor = rows.length > 0 ? rows[rows.length - 1].day : today;
  const windowStart = isoDay(dayStart(anchor) - (days - 1) * DAY_MS);
  const previousStart = isoDay(dayStart(windowStart) - days * DAY_MS);
  const current = rows.filter((r) => r.day >= windowStart);
  const previous = rows.filter(
    (r) => r.day < windowStart && r.day >= previousStart,
  );

  // G1 — today's behavioural facts.
  const todayRow = rows.find((r) => r.day === today) ?? null;
  const todayIndependent =
    todayRow && todayRow.total_attempts > 0
      ? Math.round((todayRow.unaided_correct / todayRow.total_attempts) * 100)
      : null;

  const hintTrend = trend(rows, "hint_reliance", days);
  const thinkMs = median(
    current
      .map((r) => r.median_think_ms)
      .filter((v): v is number => typeof v === "number" && v > 0),
  );

  // M4 — the gap, and where it was one window ago. A trajectory, not a verdict.
  const gap = profile.assistedUnaidedGap;
  const previousGap = assistedUnaidedGap(previous);

  // H3 — calibration over the same window as the dimensions.
  const points: CalibrationPoint[] = ((rated.data ?? []) as CalibrationAttemptRow[])
    .filter(
      (r): r is { confidence_before: number; outcome: string; completed_at: string } =>
        typeof r.confidence_before === "number" &&
        r.outcome !== null &&
        typeof r.completed_at === "string" &&
        r.completed_at.slice(0, 10) >= windowStart,
    )
    .map((r) => ({
      confidence: r.confidence_before,
      correct: r.outcome === "correct",
    }));
  const curve = calibrationCurve(points);
  const verdict = calibrationVerdict(curve);
  const meanError = calibrationError(points);

  const windowText = windowPhrase(days);
  const comparison = previousPhrase(days);

  // Hint-reliance trend, in whole percentage points with an explicit sign.
  // "0 pts" is a real answer — it means level with the previous window.
  const trendPts = hintTrend === null ? null : Math.abs(Math.round(hintTrend));
  const trendValue =
    hintTrend === null || trendPts === null
      ? "—"
      : trendPts === 0
        ? "0"
        : `${hintTrend > 0 ? "+" : "−"}${trendPts}`;
  const trendUnit =
    trendPts === null ? undefined : trendPts === 1 ? "pt" : "pts";

  return (
    <Page width="wide">
      <SegmentedNav items={PROGRESS_TABS} />

      <PageHeader
        eyebrow="Progress"
        title="Independence"
        lead={
          <>
            What you did inside Anchor over {windowText}: how much came out
            unaided, how much help was used, and how well your confidence
            matched the result. Counts and definitions, no ranking.
          </>
        }
      />

      <RangeTabs />

      {/* G1 — behavioural facts, each with the definition attached, and M4 —
          the dependence signal — sitting with them rather than paragraphs
          further down. */}
      <StatGrid className="mt-6">
        <Stat
          label="Independent today"
          value={todayIndependent === null ? "—" : todayIndependent}
          unit={todayIndependent === null ? undefined : "%"}
          icon="brainOnly"
          tone={todayIndependent === null ? "default" : "green"}
          hint={
            todayRow && todayRow.total_attempts > 0 ? (
              <>
                <span className="font-semibold text-text-2">
                  What this counts.{" "}
                </span>
                Of the <Num>{todayRow.total_attempts}</Num> items you finished
                today, the share you got right with no hint and no worked
                solution.
              </>
            ) : (
              <>
                <span className="font-semibold text-text-2">
                  What this counts.{" "}
                </span>
                The items you finish today that you get right with no hint and
                no worked solution. Start a set and it fills in.
              </>
            )
          }
        />

        <Stat
          label="Hint reliance trend"
          value={trendValue}
          unit={trendUnit}
          icon="info"
          hint={
            hintTrend === null ? (
              <>
                <span className="font-semibold text-text-2">
                  What this counts.{" "}
                </span>
                Hint reliance is the share of items where you asked for at least
                one hint. A comparison needs at least <Num>{MIN_SAMPLE}</Num>{" "}
                items in {windowText} and in {comparison}.
              </>
            ) : (
              <>
                <span className="font-semibold text-text-2">
                  What this counts.{" "}
                </span>
                Hint reliance is the share of items where you asked for at least
                one hint. This is the change against {comparison}, measured in
                percentage points. One point is one item in a hundred, not one
                percent of the old figure.
              </>
            )
          }
        />

        <Stat
          label="Think time"
          value={thinkMs === null ? "—" : Math.round(thinkMs / 1000)}
          unit={thinkMs === null ? undefined : "s"}
          icon="clock"
          hint={
            <>
              <span className="font-semibold text-text-2">
                What this counts.{" "}
              </span>
              Help-seeking timing: the median gap between the item appearing and
              your first submission or first hint request, taken across the days
              you practised in {windowText}.
            </>
          }
        />

        <Stat
          label="Assisted − unaided"
          value={gap === null ? "—" : `${gap > 0 ? "+" : ""}${Math.round(gap)}`}
          unit={
            gap === null
              ? undefined
              : Math.abs(Math.round(gap)) === 1
                ? "pt"
                : "pts"
          }
          icon="target"
          tone={gap === null ? "default" : "brand"}
          hint={
            gap === null ? (
              <>
                <span className="font-semibold text-text-2">
                  Dependence signal.{" "}
                </span>
                Needs <Num>{MIN_SAMPLE}</Num> attempts with help and{" "}
                <Num>{MIN_SAMPLE}</Num> without. The smaller side currently has{" "}
                <Num>{profile.gapSample}</Num>{" "}
                {profile.gapSample === 1 ? "attempt" : "attempts"}.
              </>
            ) : (
              <>
                <span className="font-semibold text-text-2">
                  Dependence signal.{" "}
                </span>
                Across {windowText}, the smaller side has{" "}
                <Num>{profile.gapSample}</Num>{" "}
                {profile.gapSample === 1 ? "attempt" : "attempts"}.{" "}
                {previousGap === null ? (
                  <>No comparison with {comparison} yet.</>
                ) : (
                  <>
                    It was{" "}
                    <Num>
                      {previousGap > 0 ? "+" : ""}
                      {Math.round(previousGap)}
                    </Num>{" "}
                    over {comparison}.
                  </>
                )}
              </>
            )
          }
        />
      </StatGrid>

      <WhyThis k="independence" className="mt-4" />

      {/* The reasoning, kept whole and kept collapsed. R1 / F4 / M4. */}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Disclosure summary="How to read the assisted − unaided gap">
          <p className="text-sm leading-relaxed">
            This is how often you are right when help is available, minus how
            often you are right working alone. A wide positive gap means the
            accuracy is leaning on the assistance. A gap near zero means the two
            match, and a negative number means the unaided items are going
            better than the assisted ones. It describes how the work is getting
            done, not how clever anyone is.
          </p>
          <Well className="mt-3 text-sm leading-relaxed">
            <span className="font-semibold">Try next. </span>
            Work a set through without opening a hint. The unaided side of this
            comparison is the side short of items, and a wide gap closes from
            that end.
          </Well>
          <ProxyNote className="mt-3" />
        </Disclosure>

        <Disclosure summary="Why there is no single score">
          <p className="text-sm leading-relaxed">
            Anchor does not add these up. Accuracy, time taken, hint use and
            retention are different behaviours, counted over different
            denominators, from samples of different sizes. A composite of them
            is not a validated construct, so one number would state a quantity
            no evidence supports and would bury the sample size that makes each
            figure readable in the first place.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed">
            So you get <Num>6</Num> dimensions, each with its own interval and
            its own count, and nothing that ranks you against anyone else.
          </p>
          <ProxyNote variant="block" className="mt-3">
            Every figure on this page is a count of what you did in this app
            over {windowText}.
          </ProxyNote>
        </Disclosure>
      </div>

      {/* F1–F5 — the dimensions, side by side, never combined. */}
      <Section
        title="The six dimensions"
        description="Each one counts a different behaviour over a different denominator, so each carries its own sample size and its own 95% interval. Below the five-item floor a card says so instead of printing a number."
      >
        <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profile.dimensions.map((dimension, i) => (
            <DimensionCard
              key={dimension.key}
              dimension={dimension}
              comparisonLabel={comparison}
              nextAction={NEXT_ACTION[dimension.key]}
              index={i}
            />
          ))}
        </div>
      </Section>

      {/* H3 — predicted against actual, by band. */}
      <Section
        title="Confidence against results"
        description="Each point is a band of confidence ratings you gave before answering, plotted against how often you turned out to be right in that band."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CalibrationChart bins={curve} />
          </Card>
          <Card className="h-full">
            <h3 className="t-eyebrow">Reading the curve</h3>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed">{verdict}</p>
            {meanError !== null && (
              <p className="mt-3 text-sm leading-relaxed text-text-2">
                Average distance between a rating and the result:{" "}
                <Num>{Math.round(meanError)}</Num> points, from{" "}
                <Num>{points.length}</Num>{" "}
                {points.length === 1 ? "rated item" : "rated items"} in{" "}
                {windowText}.
              </p>
            )}
            <ProxyNote variant="block" className="mt-4">
              Calibration here is the distance between a number you typed and an
              outcome graded against a verified key.
            </ProxyNote>
            <WhyThis k="confidenceRating" className="mt-4" />
          </Card>
        </div>
      </Section>

      {/* §15 — the honesty surface, linked from the dashboard that uses it. */}
      <Section className="mt-10">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <h2 className="t-section">Where these ideas come from</h2>
              <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-2">
                Anchor is built on a hypothesis about attempting first and
                fading help, and that hypothesis has evidence behind it with
                real limits. The effect sizes, the studies, and the things the
                research does not show are written out in full.
              </p>
            </div>
            <Link
              href="/about-the-evidence"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
            >
              Read about the evidence
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </Card>
      </Section>
    </Page>
  );
}
