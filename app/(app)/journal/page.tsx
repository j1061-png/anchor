import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { asResearchAdmin } from "@/lib/research/items";
import { Page, PageHeader, Section } from "@/components/ui/page";
import { Card, Well } from "@/components/ui/card";
import { SegmentedNav } from "@/components/ui/segmented";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { WhyThis } from "@/components/ui/why-this";
import { REVIEW_TABS } from "@/components/review/tabs";
import { JournalForm, type OpenAttempt } from "./entry-form";
import { MathText } from "@/components/math-text";

// N4 — the error journal. The student writes, in their own words, why the
// error happened and what to do next. Entries come back when the same
// misconception shows up again, because recurrence is the measure.

export const metadata = { title: "Error journal" };

type Row = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

function asRows(data: unknown): Row[] {
  if (!Array.isArray(data)) return [];
  return data.filter((row): row is Row => typeof row === "object" && row !== null);
}

interface Entry {
  id: string;
  itemId: string | null;
  stem: string | null;
  tag: string | null;
  whatWentWrong: string;
  whatToDoNext: string | null;
  createdAt: string | null;
  revisitedAt: string | null;
  /** Recorded by the engine when the same misconception came back. */
  flaggedRecurred: boolean;
  /** How many entries in this journal carry the same misconception tag. */
  tagCount: number;
}

const WRONG_OUTCOMES = ["incorrect", "partial", "low_effort"];

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { attempt } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware guards this

  // The generated Database type predates the research migration. These reads
  // run as the signed-in user, so RLS scopes every row to them.
  const read = asResearchAdmin(supabase);

  const [entryResult, attemptResult] = await Promise.all([
    read
      .from("error_journal")
      .select(
        "id, item_id, item_attempt_id, misconception_tag, what_went_wrong, what_to_do_next, recurred, revisited_at, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    read
      .from("item_attempts")
      .select("id, item_id, outcome, misconception_tag, completed_at, started_at")
      .eq("user_id", user.id)
      .in("outcome", WRONG_OUTCOMES)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  const entryRows = asRows(entryResult.data);
  const attemptRows = asRows(attemptResult.data).filter(
    (row) => str(row.completed_at) !== null,
  );

  const itemIds = [
    ...new Set(
      [...entryRows, ...attemptRows]
        .map((row) => str(row.item_id))
        .filter((id): id is string => id !== null),
    ),
  ];

  const stemById = new Map<string, string>();
  if (itemIds.length > 0) {
    const itemResult = await read
      .from("items_public")
      .select("id, stem")
      .in("id", itemIds)
      .limit(itemIds.length);
    for (const row of asRows(itemResult.data)) {
      const id = str(row.id);
      const stem = str(row.stem);
      if (id && stem) stemById.set(id, stem);
    }
  }

  const tagCounts = new Map<string, number>();
  for (const row of entryRows) {
    const tag = str(row.misconception_tag);
    if (tag) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  const entries: Entry[] = entryRows
    .map((row) => {
      const id = str(row.id);
      const wrong = str(row.what_went_wrong);
      if (!id || !wrong) return null;
      const itemId = str(row.item_id);
      const tag = str(row.misconception_tag);
      return {
        id,
        itemId,
        stem: itemId ? (stemById.get(itemId) ?? null) : null,
        tag,
        whatWentWrong: wrong,
        whatToDoNext: str(row.what_to_do_next),
        createdAt: str(row.created_at),
        revisitedAt: str(row.revisited_at),
        flaggedRecurred: row.recurred === true,
        tagCount: tag ? (tagCounts.get(tag) ?? 1) : 1,
      } satisfies Entry;
    })
    .filter((entry): entry is Entry => entry !== null);

  const recurring = (entry: Entry) => entry.flaggedRecurred || entry.tagCount > 1;

  // Resurfaced first: an entry whose misconception came back is the one worth
  // reading again.
  const ordered = [...entries].sort((a, b) => {
    const byRecurrence = Number(recurring(b)) - Number(recurring(a));
    if (byRecurrence !== 0) return byRecurrence;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  const journaledAttempts = new Set(
    entryRows.map((row) => str(row.item_attempt_id)).filter(Boolean),
  );

  const open: OpenAttempt[] = attemptRows
    .map((row) => {
      const id = str(row.id);
      if (!id || journaledAttempts.has(id)) return null;
      const itemId = str(row.item_id);
      return {
        id,
        stem: itemId ? (stemById.get(itemId) ?? "An item from an earlier session") : "An item from an earlier session",
        tag: str(row.misconception_tag),
      } satisfies OpenAttempt;
    })
    .filter((row): row is OpenAttempt => row !== null);

  const recurringCount = entries.filter(recurring).length;

  return (
    <Page width="wide">
      <SegmentedNav items={REVIEW_TABS} />

      <PageHeader
        eyebrow="Review"
        title="Your mistakes, in your own words."
        lead="After a wrong answer, write what you were actually thinking and one thing you will do differently. An entry comes back when the same misconception does — that repeat is the thing worth watching, not the number of errors."
      />

      <div className="stagger grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat
          icon="journal"
          label="Entries written"
          value={entries.length}
          hint="Every one written by you. Nothing here is generated — an explanation you did not produce tests nothing."
        />
        <Stat
          icon="rotate"
          label="Came back"
          value={recurringCount}
          tone={recurringCount > 0 ? "brand" : "default"}
          hint="Entries whose misconception showed up again. These are the ones worth rereading before your next session."
        />
        <Stat
          icon="clock"
          label="Waiting to write up"
          value={open.length}
          hint="Recent wrong answers with no entry yet. Writing one is easiest while you still remember what you were thinking."
        />
      </div>

      <WhyThis k="errorJournal" className="mt-4" />

      <Section
        title="New entry"
        description="Two questions. Both answered in your words, not the app's."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <JournalForm attempts={open} preselected={attempt ?? null} />
          </div>
          <Well>
            <p className="t-eyebrow">What happens to it</p>
            <ul className="mt-2.5 flex flex-col gap-2.5 text-sm leading-relaxed text-text-2">
              <li className="flex gap-2.5">
                <Icon
                  name="check"
                  size={15}
                  className="mt-0.5 shrink-0 text-text-3"
                />
                It is tagged with the misconception behind the wrong answer.
              </li>
              <li className="flex gap-2.5">
                <Icon
                  name="rotate"
                  size={15}
                  className="mt-0.5 shrink-0 text-text-3"
                />
                If the same misconception appears again, the entry is marked as
                having come back and moves to the top of this page.
              </li>
              <li className="flex gap-2.5">
                <Icon
                  name="lock"
                  size={15}
                  className="mt-0.5 shrink-0 text-text-3"
                />
                Nobody else sees it. It is not scored and it costs no XP to get
                one wrong.
              </li>
            </ul>
          </Well>
        </div>
      </Section>

      <Section
        title="Past entries"
        description={
          ordered.length > 0
            ? "Entries whose mistake came back are listed first."
            : undefined
        }
      >
        {ordered.length === 0 ? (
          <Card>
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-raised text-text-3">
                <Icon name="journal" size={19} />
              </span>
              <div>
                <p className="font-display text-base font-bold">
                  Nothing written yet.
                </p>
                <p className="mt-1.5 max-w-[58ch] text-sm leading-relaxed text-text-2">
                  This page is where a wrong answer turns into something you can
                  study. The first entry usually comes right after a session,
                  while you still remember the reasoning that led you astray —
                  {open.length > 0 ? (
                    <>
                      {" "}
                      and you already have{" "}
                      <span className="num text-text">{open.length}</span> answer
                      {open.length === 1 ? "" : "s"} above waiting to be written
                      up.
                    </>
                  ) : (
                    " so do a session and come back the moment you get one wrong."
                  )}
                </p>
                {open.length === 0 && (
                  <Link
                    href="/today"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
                  >
                    Start today&apos;s five
                    <Icon name="arrowRight" size={15} />
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((entry) => (
              <li key={entry.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    {recurring(entry) && (
                      <Badge tone="gold" icon="rotate">
                        Came back
                        {entry.tagCount > 1 ? (
                          <>
                            {" "}
                            <span className="num">{entry.tagCount}×</span>
                          </>
                        ) : null}
                      </Badge>
                    )}
                    {entry.tag && <Badge tone="neutral">{entry.tag}</Badge>}
                    {entry.createdAt && (
                      <span className="num ml-auto text-xs text-text-3">
                        {entry.createdAt.slice(0, 10)}
                      </span>
                    )}
                  </div>

                  {entry.stem && (
                    <p className="mt-3.5 font-semibold leading-snug">
                      <MathText text={entry.stem} />
                    </p>
                  )}

                  <dl className="mt-3.5 flex flex-col gap-3 text-sm">
                    <div>
                      <dt className="t-eyebrow">What went wrong</dt>
                      <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-text-2">
                        {entry.whatWentWrong}
                      </dd>
                    </div>
                    {entry.whatToDoNext && (
                      <div>
                        <dt className="t-eyebrow">What to do next</dt>
                        <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-text-2">
                          {entry.whatToDoNext}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {entry.revisitedAt && (
                    <p className="mt-auto pt-4 text-xs text-text-3">
                      Last revisited{" "}
                      <span className="num">
                        {entry.revisitedAt.slice(0, 10)}
                      </span>
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Page>
  );
}
