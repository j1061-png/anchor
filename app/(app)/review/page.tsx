import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { asResearchAdmin } from "@/lib/research/items";
import { MIN_SAMPLE, wilsonInterval } from "@/lib/research/independence";
import { PROXY_DISCLAIMER } from "@/lib/research/types";
import { Page, PageHeader, Section } from "@/components/ui/page";
import { Card, Well } from "@/components/ui/card";
import { SegmentedNav } from "@/components/ui/segmented";
import { Stat } from "@/components/ui/stat";
import { Icon } from "@/components/ui/icon";
import { WhyThis } from "@/components/ui/why-this";
import { REVIEW_TABS } from "@/components/review/tabs";
import { DueList } from "./due-list";

// N8 / A3 — the spaced retrieval surface. Expanding intervals, shown plainly,
// framed as holding on to what you already learned (A6) rather than as a score.
//
// A7: the streak shown here is `profiles.streak_current`, the run of days with
// a completed daily session — the only streak anything in the app writes. The
// copy says exactly that, because a number nobody can move is worse than no
// number at all.

export const metadata = { title: "Review" };

type Row = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const int = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

function asRows(data: unknown): Row[] {
  if (!Array.isArray(data)) return [];
  return data.filter((row): row is Row => typeof row === "object" && row !== null);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware guards this

  // The generated Database type predates the research migration. These reads
  // run as the signed-in user, so RLS scopes every row to them.
  const read = asResearchAdmin(supabase);

  const [profileResult, reviewResult, dailyResult] = await Promise.all([
    read.from("profiles").select("streak_current").eq("id", user.id).limit(1),
    read
      .from("reviews")
      .select("item_id, due_on, interval_days, repetitions, lapses")
      .eq("user_id", user.id)
      .order("due_on", { ascending: true })
      .limit(100),
    read
      .from("independence_daily")
      .select("day, delayed_retention_due, delayed_retention_correct")
      .eq("user_id", user.id)
      .order("day", { ascending: false })
      .limit(28),
  ]);

  const dailyStreak = int(asRows(profileResult.data)[0]?.streak_current);

  const scheduled = asRows(reviewResult.data);
  const now = today();
  const upcoming = scheduled
    .map((row) => ({ dueOn: str(row.due_on), intervalDays: int(row.interval_days, 1) }))
    .filter((row): row is { dueOn: string; intervalDays: number } => row.dueOn !== null)
    .filter((row) => row.dueOn > now)
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));

  const daily = asRows(dailyResult.data);
  const retentionDue = daily.reduce(
    (total, row) => total + int(row.delayed_retention_due),
    0,
  );
  const retentionCorrect = daily.reduce(
    (total, row) => total + int(row.delayed_retention_correct),
    0,
  );
  const retentionPct =
    retentionDue >= MIN_SAMPLE ? Math.round((retentionCorrect / retentionDue) * 100) : null;
  const retentionCi =
    retentionPct === null ? null : Math.round(wilsonInterval(retentionCorrect, retentionDue));

  return (
    <Page width="wide">
      <SegmentedNav items={REVIEW_TABS} />

      <PageHeader
        eyebrow="Review"
        title="Bring it back as it starts to fade."
        lead="Everything here is something you have already met. The gap since you last saw it is the point: recalling it after it has begun to slip is what makes it stick. What you keep is the target, not a mark out of ten."
        action={
          <Link
            href="/learn?mode=review"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--r-md)] bg-brand px-5 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-brand)] transition-all duration-[130ms] hover:-translate-y-px hover:brightness-110"
          >
            Start today&apos;s review
            <Icon name="arrowRight" size={16} />
          </Link>
        }
      />

      <div className="stagger grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat
          icon="flame"
          label="Daily streak"
          value={dailyStreak}
          unit={dailyStreak === 1 ? "day" : "days"}
          hint="Days in a row you finished the daily session. Getting answers wrong keeps it; skipping the day does not. Review and practice do not extend it."
        />
        <Stat
          icon="target"
          label="Held on to"
          value={retentionPct === null ? "—" : `${retentionPct}%`}
          tone={retentionPct === null ? "default" : "green"}
          hint={
            retentionPct === null ? (
              <>
                Needs <span className="num">{MIN_SAMPLE}</span> delayed checks
                before this means anything. You have{" "}
                <span className="num">{retentionDue}</span>.
              </>
            ) : (
              <>
                <span className="num">±{retentionCi}</span> pts, n=
                <span className="num">{retentionDue}</span> delayed checks over
                the last <span className="num">28</span> days. {PROXY_DISCLAIMER}
              </>
            )
          }
        />
        <Stat
          icon="clock"
          label="Scheduled ahead"
          value={upcoming.length}
          unit={upcoming.length === 1 ? "item" : "items"}
          hint="Waiting for their day. There is nothing to do about these until they fall due — the waiting is the mechanism."
        />
      </div>

      <WhyThis k="spacedReview" className="mt-4" />

      <Section
        title="Due today"
        description="Answer these from memory first. A wrong answer you then work out is worth more than a right one you looked up."
      >
        <DueList />
      </Section>

      <Section
        title="Coming up"
        description="The next few checks already on the schedule."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            {upcoming.length === 0 ? (
              <div className="py-2">
                <p className="text-sm font-semibold">Nothing scheduled yet.</p>
                <p className="mt-1.5 max-w-[54ch] text-sm leading-relaxed text-text-2">
                  An item joins this schedule the first time you answer it, in a
                  daily session, a practice set or a learn session. Answer
                  anything once and it will come back here.
                </p>
                <Link
                  href="/today"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
                >
                  Start today&apos;s five
                  <Icon name="arrowRight" size={15} />
                </Link>
              </div>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {upcoming.slice(0, 8).map((row, position) => (
                  <li
                    key={`${row.dueOn}-${position}`}
                    className="flex items-center justify-between gap-3 rounded-[var(--r-sm)] bg-raised px-3.5 py-2.5 text-sm"
                  >
                    <span className="num">{row.dueOn}</span>
                    <span className="text-text-3">
                      gap of{" "}
                      <span className="num text-text-2">{row.intervalDays}</span>{" "}
                      {row.intervalDays === 1 ? "day" : "days"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Well>
            <p className="t-eyebrow">How the gap grows</p>
            <p className="mt-2.5 text-sm leading-relaxed text-text-2">
              Each time you get one right the wait widens:{" "}
              <span className="num text-text">1</span> day, then{" "}
              <span className="num text-text">3</span>, then further out every
              time after that. Get it wrong and it comes back tomorrow.
            </p>
            <p className="mt-2.5 text-xs leading-relaxed text-text-3">
              Reviewing something while it is still fresh feels better and
              teaches you less, so Anchor will not let you pull an item forward.
            </p>
          </Well>
        </div>
      </Section>
    </Page>
  );
}
