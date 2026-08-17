"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, Well } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { daysBetween, localDate } from "@/lib/streak";
import type { AttemptOutcome } from "@/lib/research/types";
import { MathText } from "@/components/math-text";

// E2 — the self-check. The verified key is released here, after the work is
// in, and the student compares their own answer against it. Marking already
// happened deterministically on the server (I3, I6); this screen exists so the
// student sees the key rather than a verdict.

export interface ItemResult {
  itemId: string;
  itemAttemptId: string | null;
  stem: string;
  yourAnswer: string;
  outcome: AttemptOutcome | null;
  key: string | null;
  workedSolution: string | null;
  nextReviewOn: string | null;
}

const OUTCOME_LABEL: Record<AttemptOutcome, string> = {
  correct: "Matches the key",
  partial: "Part of it matches",
  incorrect: "Does not match",
  skipped: "Left blank",
  low_effort: "Not enough to mark",
};

const OUTCOME_TONE: Record<AttemptOutcome, "green" | "amber" | "neutral"> = {
  correct: "green",
  partial: "amber",
  incorrect: "neutral",
  skipped: "neutral",
  low_effort: "neutral",
};

/** Days until the next spaced check, or null when nothing was scheduled (N8). */
function daysUntilNextCheck(nextReviewOn: string | null): number | null {
  if (!nextReviewOn) return null;
  const today = localDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
  return Math.max(0, daysBetween(today, nextReviewOn));
}

export function SelfCheck({
  sessionId,
  itemsTotal,
  itemsCorrect,
  aiFreeStreak,
  aiFreeLongest,
  results,
  onDone,
}: {
  sessionId: string;
  itemsTotal: number;
  itemsCorrect: number;
  aiFreeStreak: number;
  aiFreeLongest: number;
  results: ItemResult[];
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/brain-only/${sessionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ selfChecked: true }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not record the self-check.");
      }
      onDone();
    } catch (e) {
      setBusy(false);
      setError(
        e instanceof Error ? e.message : "Could not record the self-check. Try again.",
      );
    }
  };

  const record = aiFreeStreak >= aiFreeLongest && aiFreeStreak > 0;

  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Self-check against the key"
    >
      <Card className="rise-in">
        <Badge tone="green" icon="check">
          Session done
        </Badge>
        <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight">
          Now check it yourself.
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-text-2">
          <span className="num font-semibold text-text">{itemsCorrect}</span>
          <span className="text-text-3">/</span>
          <span className="num font-semibold text-text">{itemsTotal}</span>{" "}
          matched the verified key, with no help at any point. Read your answer
          against each key below — noticing the difference yourself is the part
          that teaches you something.
        </p>
        <p className="mt-2.5 text-sm text-text-3">
          AI-free run:{" "}
          <span className="num text-text-2">{aiFreeStreak}</span>{" "}
          {aiFreeStreak === 1 ? "session" : "sessions"}
          {record ? ". That is your longest run so far." : "."}
        </p>
      </Card>

      <ol className="flex flex-col gap-3">
        {results.map((result, position) => {
          const gap = daysUntilNextCheck(result.nextReviewOn);
          return (
            <li key={result.itemId}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="t-eyebrow">
                    Item <span className="num">{position + 1}</span>
                  </span>
                  {result.outcome ? (
                    <Badge
                      tone={OUTCOME_TONE[result.outcome]}
                      icon={result.outcome === "correct" ? "check" : undefined}
                    >
                      {OUTCOME_LABEL[result.outcome]}
                    </Badge>
                  ) : (
                    <Badge tone="neutral">No key on file</Badge>
                  )}
                </div>

                <p className="mt-3 font-semibold leading-snug">
                  <MathText text={result.stem} />
                </p>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Well>
                    <dt className="t-eyebrow">You wrote</dt>
                    <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-2">
                      {result.yourAnswer || "Nothing"}
                    </dd>
                  </Well>
                  <Well>
                    <dt className="t-eyebrow">Verified key</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-text">
                      {result.key ?? "This item has no key that can be shown."}
                    </dd>
                  </Well>
                </dl>

                {result.workedSolution && (
                  <div className="mt-3">
                    <p className="t-eyebrow">How it works</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-2">
                      {result.workedSolution}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {gap !== null && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-3">
                      <Icon name="clock" size={14} />
                      {gap === 0 ? (
                        "Next check today"
                      ) : (
                        <>
                          Next check in <span className="num">{gap}</span>{" "}
                          {gap === 1 ? "day" : "days"}
                        </>
                      )}
                    </span>
                  )}
                  {result.outcome !== "correct" && result.itemAttemptId && (
                    <Link
                      href={`/journal?attempt=${result.itemAttemptId}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
                    >
                      Write what went wrong
                      <Icon name="arrowRight" size={15} />
                    </Link>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      <Card>
        <p className="text-sm leading-relaxed text-text-2">
          Compared every answer against its key? Say so and the session goes on
          the record. Nothing is checked for you — this is your word.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={confirm} loading={busy}>
            {busy ? "Recording" : "Record the self-check"}
          </Button>
          {error && (
            <p className="text-sm font-semibold text-brand" role="alert">
              {error}
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
