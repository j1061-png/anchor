import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/streak";
import { PUZZLE_LABELS, type SessionSlot } from "@/lib/types";
import { Page, Section } from "@/components/ui/page";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { WhyThis } from "@/components/ui/why-this";
import { StartSessionButton } from "./start-button";
import { MidnightCountdown } from "./countdown";
import { ChallengeCta } from "@/components/share/challenge-cta";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // the shell redirects

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, streak_current, streak_freezes, display_name, friend_code")
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

  // `reviews` belongs to the research schema, which the hand-written Database
  // types predate; cast rather than block the page on regenerating them.
  const research = supabase as unknown as {
    from: (t: string) => {
      select: (
        c: string,
        o: { count: "exact"; head: true },
      ) => {
        eq: (
          col: string,
          v: string,
        ) => {
          lte: (col: string, v: string) => Promise<{ count: number | null }>;
        };
      };
    };
  };

  // A missing reviews table must not take the home page down with it.
  const dueReviews = (async () => {
    try {
      const { count } = await research
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("due_on", today);
      return count ?? 0;
    } catch {
      return 0;
    }
  })();

  const [{ count: answered }, dueCount] = await Promise.all([
    session
      ? supabase
          .from("attempts")
          .select("id", { count: "exact", head: true })
          .eq("session_id", session.id)
      : Promise.resolve({ count: 0 }),
    dueReviews,
  ]);

  const firstName = profile?.display_name?.split(" ")[0] ?? "you";
  const done = answered ?? 0;
  const due = dueCount;
  const streak = profile?.streak_current ?? 0;
  const freezes = profile?.streak_freezes ?? 0;
  const status = session?.status ?? "not_started";
  const slots = (session?.puzzle_seeds as SessionSlot[] | null) ?? [];

  return (
    <Page width="wide">
      {/* --- The one thing to do now ------------------------------------- */}
      <section className="rise-in relative overflow-hidden rounded-[var(--r-xl)] border border-[var(--line)] bg-surface p-5 shadow-[var(--shadow-md)] sm:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--brand) 26%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          {status === "not_started" && (
            <>
              <Badge tone="brand" icon="today">
                Today&apos;s five
              </Badge>
              <h1 className="t-hero mt-3">
                Ready when you are, {firstName}.
              </h1>
              <p className="mt-2.5 max-w-[46ch] text-sm leading-relaxed text-text-2 sm:text-[0.9375rem]">
                Five puzzles picked for the categories you are weakest in. The
                first 45 seconds of each are yours alone — no hints, no answers.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-6">
                <StartSessionButton label="Start today's session" />
                <span className="num text-sm text-text-3">
                  about 8 minutes
                </span>
              </div>
            </>
          )}

          {status === "in_progress" && (
            <>
              <Badge tone="amber" icon="clock">
                In progress
              </Badge>
              <h1 className="t-hero mt-3">Pick up where you stopped.</h1>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-2">
                <span className="num font-semibold text-text">{done}/5</span>{" "}
                answered. The clock only runs while a puzzle is open.
              </p>
              <div className="mt-5 max-w-md">
                <ProgressBar value={done / 5} label={`${done} of 5 answered`} />
              </div>
              <ol className="mt-4 flex flex-wrap gap-2">
                {slots.map((s, i) => (
                  <li
                    key={i}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      i < done
                        ? "border-transparent bg-raised text-text-3 line-through"
                        : "border-[var(--line-strong)] text-text-2"
                    }`}
                  >
                    {PUZZLE_LABELS[s.type]}
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <StartSessionButton
                  label="Continue session"
                  sessionId={session!.id}
                />
              </div>
            </>
          )}

          {status === "complete" && (
            <>
              <Badge tone="green" icon="check">
                Done for today
              </Badge>
              <h1 className="t-hero mt-3">
                {Math.round((session!.accuracy ?? 0) * 5)} of 5 solved.
              </h1>
              {session!.feedback && (
                <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-text-2">
                  {session!.feedback}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={`/session/${session!.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
                >
                  See the full recap
                  <Icon name="arrowRight" size={15} />
                </Link>
                <span className="text-sm text-text-3">
                  Tomorrow&apos;s five in <MidnightCountdown />
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      <WhyThis k="attemptFirst" className="mt-4" />

      {/* --- Everything else you could do -------------------------------- */}
      <Section
        title="More ways to train"
        description="All optional. Each one trains something the daily five does not."
      >
        <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <TrainCard
            href="/review"
            icon="review"
            title="Review"
            body="Things you solved before, brought back just as they start to fade."
            badge={due > 0 ? `${due} due` : "Nothing due"}
            tone={due > 0 ? "brand" : "neutral"}
          />
          <TrainCard
            href="/learn"
            icon="learn"
            title="Learn"
            body="Work through a problem with a coach that asks questions instead of answering."
          />
          <TrainCard
            href="/brain-only"
            icon="brainOnly"
            title="Brain-only"
            body="A session with no hints and no AI at all. The unaided practice that stops the skill fading."
          />
          <TrainCard
            href="/practice"
            icon="practice"
            title="Practice"
            body="Extra puzzles in a category you choose. Moves your ratings, worth half XP."
          />
          <TrainCard
            href="/journal"
            icon="journal"
            title="Error journal"
            body="Your own mistakes, written up in your words, so they become the thing you study."
          />
          <TrainCard
            href="/progress"
            icon="progress"
            title="Progress"
            body="Your XP timeline, independence profile and every milestone you have reached."
          />
        </div>
      </Section>

      {/* --- Streak + challenge ------------------------------------------ */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Icon name="flame" size={16} className="text-brand" />
                <p className="t-eyebrow">Retrieval days</p>
              </div>
              <p className="num mt-2 text-[2.25rem] leading-none">{streak}</p>
              <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-text-2">
                Days in a row you actually tried to recall something.
                {freezes > 0 && (
                  <>
                    {" "}
                    <span className="num">{freezes}</span> freeze
                    {freezes === 1 ? "" : "s"} banked.
                  </>
                )}
              </p>
              <p className="mt-1.5 text-xs text-text-3">
                Counts attempts, not opens. Turning up is not the point.
              </p>
            </div>
            <div className="hidden shrink-0 sm:block">
              <StreakDots streak={streak} />
            </div>
          </div>
          <WhyThis k="spacedReview" className="mt-4" />
        </Card>

        <ChallengeCta friendCode={profile?.friend_code} />
      </div>
    </Page>
  );
}

function TrainCard({
  href,
  icon,
  title,
  body,
  badge,
  tone = "neutral",
}: {
  href: string;
  icon: IconName;
  title: string;
  body: string;
  badge?: string;
  tone?: "brand" | "neutral";
}) {
  return (
    <Link href={href} className="group block">
      <Card interactive bare className="h-full p-3.5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <span className="grid size-9 place-items-center rounded-[var(--r-md)] bg-raised text-text-2 transition-colors group-hover:bg-[var(--brand-soft)] group-hover:text-brand sm:size-10">
            <Icon name={icon} size={18} />
          </span>
          {badge && (
            <Badge tone={tone === "brand" ? "brand" : "neutral"}>{badge}</Badge>
          )}
        </div>
        <h3 className="mt-2.5 font-display text-sm font-bold sm:mt-3.5 sm:text-base">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-text-2 sm:mt-1.5 sm:text-sm">
          {body}
        </p>
        <span className="mt-3 hidden items-center gap-1 text-sm font-semibold text-text-2 transition-colors group-hover:text-brand sm:inline-flex">
          Open
          <Icon
            name="chevronRight"
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Card>
    </Link>
  );
}

/** Sixteen cells: the meter reads as a run of days, not a bar to fill. */
function StreakDots({ streak }: { streak: number }) {
  const lit = Math.min(16, streak);
  return (
    <div className="grid grid-cols-4 gap-1.5" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className={`size-3 rounded-[3px] ${i < lit ? "bg-brand" : "bg-sunken"}`}
        />
      ))}
    </div>
  );
}
