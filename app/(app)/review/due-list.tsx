"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MathText } from "@/components/math-text";
import { Card, Well } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

// Today's due items (N8), read from GET /api/learn/review/due.
//
// The route belongs to the learn engine, so this reads its payload
// defensively: an array, or an object holding one under a few likely names,
// with each entry either flat or wrapping a PublicItem. Anything it cannot read
// is reported as such rather than rendered as an empty queue.

interface DueEntry {
  key: string;
  stem: string | null;
  subject: string | null;
  topic: string | null;
  dueOn: string | null;
  intervalDays: number | null;
  repetitions: number | null;
  ease: number | null;
  daysOverdue: number | null;
}

type Payload = Record<string, unknown>;

const isRecord = (v: unknown): v is Payload => typeof v === "object" && v !== null;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

function pickArray(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return null;
  for (const key of ["items", "due", "reviews", "entries", "queue"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }
  return null;
}

function toEntry(raw: unknown, position: number): DueEntry | null {
  if (!isRecord(raw)) return null;
  const item = isRecord(raw.item) ? raw.item : {};
  const get = (...keys: string[]): unknown => {
    for (const key of keys) {
      if (raw[key] !== undefined) return raw[key];
      if (item[key] !== undefined) return item[key];
    }
    return undefined;
  };

  const id =
    str(get("itemId", "item_id", "id")) ?? `due-${position}`;

  return {
    key: id,
    stem: str(get("stem", "question")),
    subject: str(get("subject")),
    topic: str(get("topic")),
    dueOn: str(get("dueOn", "due_on")),
    intervalDays: num(get("intervalDays", "interval_days")),
    repetitions: num(get("repetitions")),
    ease: num(get("ease")),
    daysOverdue: num(get("daysOverdue", "days_overdue")),
  };
}

/**
 * The expanding interval, mirroring `schedule_review` in the migration: first
 * success 1 day, second 3 days, then the previous gap multiplied by the ease.
 * The ease is only exact when the route sends it, so the copy says "about"
 * whenever it has to assume the 2.5 default.
 */
function nextGap(entry: DueEntry): { days: number; approximate: boolean } {
  const repetitions = entry.repetitions ?? 0;
  if (repetitions <= 0) return { days: 1, approximate: false };
  if (repetitions === 1) return { days: 3, approximate: false };
  const ease = Math.min(3, (entry.ease ?? 2.5) + 0.1);
  const base = entry.intervalDays ?? 3;
  return { days: Math.max(1, Math.round(base * ease)), approximate: entry.ease === null };
}

function GapCopy({ entry }: { entry: DueEntry }) {
  const { days, approximate } = nextGap(entry);
  return (
    <>
      Get it right and the next check is in{approximate ? " about" : ""}{" "}
      <span className="num text-text">{days}</span> {days === 1 ? "day" : "days"}
    </>
  );
}

export function DueList() {
  const [entries, setEntries] = useState<DueEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const response = await fetch("/api/learn/review/due");
        const payload = await response.json().catch(() => null);
        if (!live) return;
        if (!response.ok) {
          const message = isRecord(payload) ? str(payload.error) : null;
          throw new Error(message ?? "Could not read today's review queue.");
        }
        const list = pickArray(payload);
        if (list === null) {
          throw new Error("Could not read today's review queue. Reload the page.");
        }
        setEntries(
          list
            .map(toEntry)
            .filter((entry): entry is DueEntry => entry !== null),
        );
      } catch (e) {
        if (!live) return;
        setError(
          e instanceof Error
            ? e.message
            : "Could not read today's review queue. Reload the page.",
        );
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  if (error) {
    return (
      <Card>
        <p className="text-sm font-semibold text-brand" role="alert">
          {error}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-text-2">
          Your schedule is safe — this is only the reading of it. Reload the
          page and it will try again.
        </p>
      </Card>
    );
  }

  if (entries === null) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Reading your review queue"
      >
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3.5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-4 h-3 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-raised text-text-3">
            <Icon name="check" size={19} />
          </span>
          <div>
            <p className="font-display text-base font-bold">
              Nothing is due today.
            </p>
            <p className="mt-1.5 max-w-[58ch] text-sm leading-relaxed text-text-2">
              This page holds items you have already answered once and brings
              them back on the day they are about to fade. Waiting is doing
              something here — the gap is what makes the next attempt worth
              taking.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/today"
                className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
              >
                Do today&apos;s five
                <Icon name="arrowRight" size={15} />
              </Link>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-2 underline decoration-dotted underline-offset-4 hover:text-brand"
              >
                Write up a mistake instead
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-text-2">
        <span className="num font-semibold text-text">{entries.length}</span>{" "}
        {entries.length === 1 ? "item" : "items"} to bring back from memory. Try
        to recall before you check.
      </p>

      <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.key}>
            <Card className="flex h-full flex-col">
              <div className="flex flex-wrap items-center gap-2">
                {(entry.subject || entry.topic) && (
                  <Badge tone="neutral">
                    {[entry.subject, entry.topic].filter(Boolean).join(" · ")}
                  </Badge>
                )}
                {entry.daysOverdue !== null && entry.daysOverdue > 0 && (
                  <Badge tone="amber" icon="clock">
                    <span className="num">{entry.daysOverdue}</span>{" "}
                    {entry.daysOverdue === 1 ? "day" : "days"} late
                  </Badge>
                )}
              </div>

              <p className="mt-3 font-semibold leading-snug">
                {entry.stem ? (
                  <MathText text={entry.stem} />
                ) : (
                  (entry.topic ?? "An item you have seen before")
                )}
              </p>

              <div className="mt-auto pt-4">
                <p className="text-[0.8125rem] leading-relaxed text-text-2">
                  {entry.intervalDays !== null && (
                    <>
                      Last gap{" "}
                      <span className="num text-text">{entry.intervalDays}</span>{" "}
                      {entry.intervalDays === 1 ? "day" : "days"} ·{" "}
                    </>
                  )}
                  <GapCopy entry={entry} />
                </p>
                {entry.daysOverdue !== null && entry.daysOverdue > 0 && (
                  <p className="mt-1.5 text-xs leading-relaxed text-text-3">
                    Past its check date. Later is harder, which is the point.
                  </p>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Well className="mt-4">
        <p className="text-sm leading-relaxed text-text-2">
          Answering these happens in the learn session, so the hint ladder and
          the marking work the same way they always do.
        </p>
      </Well>
    </>
  );
}
