import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { asResearchAdmin } from "@/lib/research/items";
import {
  MIN_SAMPLE,
  wilsonInterval,
  type IndependenceDailyRow,
} from "@/lib/research/independence";
import { PROXY_DISCLAIMER } from "@/lib/research/types";
import { Page, PageHeader, Section } from "@/components/ui/page";
import { Card, Well } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { WhyNote } from "@/components/ui/why-this";
import { BrainOnlyRunner } from "./runner";

// Feature E — Brain-Only mode.
//
// A scheduled AI-free session. There is no hint control, no tutor entry point
// and no solution button anywhere on this route: E1 asks for the assistance to
// be absent, not disabled. The keys arrive after the session, on the self-check
// screen (E2). Nothing on this page displays or ranks by time (E6).
//
// The assisted−unaided gap belongs to /independence, which owns it with a
// selectable window and a comparison against the previous one. This page shows
// the unaided side on its own — what you can do alone, in its own right — and
// links across rather than restating the same statistic over a fixed 28 days
// as if it were a different figure.

export const metadata = { title: "Brain-only" };

type Row = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const int = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

function asRows(data: unknown): Row[] {
  if (!Array.isArray(data)) return [];
  return data.filter((row): row is Row => typeof row === "object" && row !== null);
}

function toDailyRow(row: Row): IndependenceDailyRow | null {
  const day = str(row.day);
  if (!day) return null;
  return {
    day,
    unaided_attempts: int(row.unaided_attempts),
    unaided_correct: int(row.unaided_correct),
    delayed_retention_due: int(row.delayed_retention_due),
    delayed_retention_correct: int(row.delayed_retention_correct),
    transfer_attempts: int(row.transfer_attempts),
    transfer_correct: int(row.transfer_correct),
    total_attempts: int(row.total_attempts),
    hints_requested: int(row.hints_requested),
    solutions_revealed: int(row.solutions_revealed),
    skipped: int(row.skipped),
    median_think_ms: null,
    calibration_error: null,
    self_explanations: int(row.self_explanations),
    assisted_correct: int(row.assisted_correct),
    assisted_attempts: int(row.assisted_attempts),
  };
}

interface Arm {
  correct: number;
  attempts: number;
  /** Null below the sample floor — a rate from three attempts is noise. */
  pct: number | null;
  ci: number | null;
}

function arm(correct: number, attempts: number): Arm {
  if (attempts < MIN_SAMPLE) return { correct, attempts, pct: null, ci: null };
  return {
    correct,
    attempts,
    pct: Math.round((correct / attempts) * 100),
    ci: Math.round(wilsonInterval(correct, attempts)),
  };
}

const sum = (rows: IndependenceDailyRow[], pick: (r: IndependenceDailyRow) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

export default async function BrainOnlyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware guards this

  // The generated Database type predates the research migration; this read runs
  // as the signed-in user, so RLS still scopes every row.
  const read = asResearchAdmin(supabase);

  const [profileResult, sessionResult, dailyResult] = await Promise.all([
    read.from("profiles").select("ai_free_streak, ai_free_longest").eq("id", user.id).limit(1),
    read
      .from("brain_only_sessions")
      .select("id, scheduled_for, completed_at, items_total, items_correct, self_checked")
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: false })
      .limit(10),
    read
      .from("independence_daily")
      .select(
        "day, unaided_attempts, unaided_correct, delayed_retention_due, delayed_retention_correct, transfer_attempts, transfer_correct, total_attempts, hints_requested, solutions_revealed, skipped, self_explanations, assisted_correct, assisted_attempts",
      )
      .eq("user_id", user.id)
      .order("day", { ascending: false })
      .limit(28),
  ]);

  const profile = asRows(profileResult.data)[0];
  const streak = int(profile?.ai_free_streak);
  const longest = int(profile?.ai_free_longest);

  const sessions = asRows(sessionResult.data);
  const daily = asRows(dailyResult.data)
    .map(toDailyRow)
    .filter((row): row is IndependenceDailyRow => row !== null);

  // Only the unaided arm. The comparison against assisted work lives on
  // /independence, where the window is selectable and the previous window is
  // shown beside it.
  const unaided = arm(
    sum(daily, (r) => r.unaided_correct),
    sum(daily, (r) => r.unaided_attempts),
  );

  const finishedCount = sessions.filter((row) => str(row.completed_at) !== null).length;

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Unaided practice"
        title="Brain-only."
        lead="A short set with the AI switched off — not disabled, absent. This is where you find out what you can still do on your own. Your answers are checked against the verified key afterwards, never during."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BrainOnlyRunner />
        </div>

        <Well>
          <p className="t-eyebrow">The deal</p>
          <ul className="mt-2.5 flex flex-col gap-2.5 text-sm leading-relaxed text-text-2">
            <li className="flex gap-2.5">
              <Icon name="lock" size={15} className="mt-0.5 shrink-0 text-text-3" />
              No hints, no tutor and no worked solutions while you work. None of
              it is built into this screen.
            </li>
            <li className="flex gap-2.5">
              <Icon name="target" size={15} className="mt-0.5 shrink-0 text-text-3" />
              <span>
                <span className="num text-text">5</span> items, about{" "}
                <span className="num text-text">5</span> minutes.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="check" size={15} className="mt-0.5 shrink-0 text-text-3" />
              Finishing counts. How fast you finish does not, and no clock is
              shown anywhere here.
            </li>
          </ul>
        </Well>
      </div>

      <WhyNote k="brainOnly" className="mt-4" />

      <Section
        title="What the run is worth"
        description="Two counts about the habit, and one about the work itself."
      >
        <div className="stagger grid gap-3 sm:grid-cols-3 sm:gap-4">
          <Stat
            icon="brainOnly"
            label="AI-free run"
            value={streak}
            unit={streak === 1 ? "session" : "sessions"}
            tone={streak > 0 ? "brand" : "default"}
            hint="Continues while you take no hint and no worked solution between brain-only sessions. Taking help is not a failure — it just starts the count again."
          />
          <Stat
            icon="trophy"
            label="Longest run"
            value={longest}
            unit={longest === 1 ? "session" : "sessions"}
            hint="Your best streak so far. Kept as a marker, not a target to protect at all costs."
          />
          <Stat
            icon="check"
            label="Sessions finished"
            value={finishedCount}
            hint="Brain-only sets you completed and marked. An unfinished set is not counted against you."
          />
        </div>
      </Section>

      <Section
        title="What you can do alone"
        description="The unaided side on its own, over the last 28 days."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <p className="t-eyebrow">Unaided accuracy</p>
            {unaided.pct === null ? (
              <>
                <p className="num mt-2.5 text-[2rem] leading-none text-text-3">—</p>
                <p className="mt-2.5 max-w-[54ch] text-sm leading-relaxed text-text-2">
                  Needs <span className="num text-text">{MIN_SAMPLE}</span>{" "}
                  unaided attempts before a rate means anything. You have{" "}
                  <span className="num text-text">{unaided.attempts}</span>. A
                  percentage from a handful of items is noise, so Anchor will not
                  print one.
                </p>
              </>
            ) : (
              <>
                <p className="num mt-2.5 text-[2rem] leading-none text-[var(--green)]">
                  {unaided.pct}
                  <span className="ml-1 text-base font-normal text-text-3">%</span>
                </p>
                <p className="mt-2.5 text-sm text-text-2">
                  <span className="num">±{unaided.ci}</span> pts, n=
                  <span className="num">{unaided.attempts}</span> attempts solved
                  with no hint and no worked solution.
                </p>
              </>
            )}
            <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-text-2">
              This counts every unaided attempt in the app, not only the ones in
              brain-only sets. It is the number these sessions exist to hold up
              when the help goes away.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-3">
              {PROXY_DISCLAIMER}
            </p>
          </Card>

          <Well>
            <p className="t-eyebrow">Against assisted work</p>
            <p className="mt-2.5 text-sm leading-relaxed text-text-2">
              How this compares with your accuracy when help is available lives
              on the independence page, where you can pick the window and see
              where the difference was one window ago.
            </p>
            <Link
              href="/independence"
              className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
            >
              See assisted minus unaided
              <Icon name="arrowRight" size={15} />
            </Link>
          </Well>
        </div>
      </Section>

      <Section title="Past sessions">
        {sessions.length === 0 ? (
          <Card>
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-raised text-text-3">
                <Icon name="brainOnly" size={19} />
              </span>
              <div>
                <p className="font-display text-base font-bold">
                  No brain-only sessions yet.
                </p>
                <p className="mt-1.5 max-w-[58ch] text-sm leading-relaxed text-text-2">
                  The first one sets your baseline: five items, nothing to lean
                  on, and the key only after you finish. Every session after it
                  is a check that the skill is still yours.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <ul className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((row) => {
              const id = str(row.id) ?? "";
              const done = str(row.completed_at) !== null;
              return (
                <li key={id}>
                  <Card className="flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="num text-sm text-text-2">
                        {str(row.scheduled_for)}
                      </span>
                      {done ? (
                        row.self_checked === true ? (
                          <Badge tone="green" icon="check">
                            Self-checked
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Marked</Badge>
                        )
                      ) : (
                        <Badge tone="amber" icon="clock">
                          Not finished
                        </Badge>
                      )}
                    </div>
                    {done ? (
                      <p className="num text-[1.5rem] leading-none">
                        {int(row.items_correct)}
                        <span className="text-text-3">/</span>
                        {int(row.items_total)}
                        <span className="ml-2 font-body text-xs font-semibold uppercase tracking-wide text-text-3">
                          unaided
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm leading-relaxed text-text-3">
                        Started but never submitted, so nothing was marked.
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <Well className="mt-4">
          <p className="text-sm leading-relaxed text-text-2">
            Got one wrong? Write down what happened in your{" "}
            <Link
              href="/journal"
              className="font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
            >
              error journal
            </Link>{" "}
            while you still remember what you were thinking. A mistake you have
            explained to yourself is worth more than one you have only seen
            corrected.
          </p>
        </Well>
      </Section>
    </Page>
  );
}
