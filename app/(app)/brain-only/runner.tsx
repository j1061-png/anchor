"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress";
import type { PublicItem } from "@/lib/research/types";
import { SelfCheck, type ItemResult } from "./self-check";
import { MathText } from "@/components/math-text";

// The brain-only session itself (E1). This component has no hint control, no
// tutor entry point and no solution button — there is nothing here to disable,
// because none of it is built. The keys arrive from the completion route once
// the set is submitted (E2).
//
// No clock is shown and no duration is sent: E6 rewards finishing and
// improving, never speed.

interface StartResponse {
  sessionId: string;
  scheduledFor: string;
  itemsTotal: number;
  items: PublicItem[];
}

interface CompleteResponse {
  itemsTotal: number;
  itemsCorrect: number;
  aiFreeStreak: number;
  aiFreeLongest: number;
  results: ItemResult[];
}

type Phase = "idle" | "working" | "checking";

/** Shared field styling, on design tokens so both themes work. */
const FIELD =
  "w-full rounded-[var(--r-md)] border border-[var(--line-strong)] bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-text placeholder:text-text-3";

const multiline = (item: PublicItem) =>
  item.kind === "reasoning" || item.kind === "transfer";

export function BrainOnlyRunner() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<CompleteResponse | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/brain-only", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ size: 5 }),
      });
      const data: StartResponse & { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not start the session.");
      setSessionId(data.sessionId);
      setItems(data.items ?? []);
      setAnswers({});
      setIndex(0);
      setPhase("working");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the session. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!sessionId) return;
    const payload = items
      .map((item) => ({ itemId: item.id, answer: (answers[item.id] ?? "").trim() }))
      .filter((entry) => entry.answer.length > 0);

    if (payload.length === 0) {
      setError("Write an answer for at least one item before finishing.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/brain-only/${sessionId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      const data: CompleteResponse & { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not mark the set.");
      setSummary(data);
      setPhase("checking");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark the set. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "checking" && summary && sessionId) {
    return (
      <SelfCheck
        sessionId={sessionId}
        itemsTotal={summary.itemsTotal}
        itemsCorrect={summary.itemsCorrect}
        aiFreeStreak={summary.aiFreeStreak}
        aiFreeLongest={summary.aiFreeLongest}
        results={summary.results}
        onDone={() => {
          setPhase("idle");
          setSessionId(null);
          setItems([]);
          setSummary(null);
          router.refresh();
        }}
      />
    );
  }

  if (phase === "working" && items.length > 0) {
    const item = items[index];
    const answered = items.filter((entry) => (answers[entry.id] ?? "").trim().length > 0)
      .length;
    const last = index === items.length - 1;

    return (
      <Card className="h-full" aria-labelledby="brain-only-item">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-2" aria-live="polite">
            Item <span className="num font-semibold text-text">{index + 1}</span>{" "}
            of <span className="num font-semibold text-text">{items.length}</span>{" "}
            · <span className="num">{answered}</span> answered
          </p>
          <Badge tone="brand" icon="lock">
            No help available
          </Badge>
        </div>

        <ProgressBar
          value={(index + 1) / items.length}
          className="mt-3"
          label={`Item ${index + 1} of ${items.length}`}
        />

        <p className="t-eyebrow mt-5">
          {item.subject} · {item.topic}
        </p>

        <h2
          id="brain-only-item"
          className="mt-2 font-display text-lg font-bold leading-snug"
        >
          <MathText text={item.stem} />
        </h2>

        <div className="mt-4">
          {item.distractors && item.distractors.length > 0 ? (
            <fieldset>
              <legend className="sr-only">Choose your answer</legend>
              <ul className="grid gap-2 sm:grid-cols-2">
                {item.distractors.map((option) => {
                  const chosen = (answers[item.id] ?? "") === option;
                  return (
                    <li key={option}>
                      <label
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--r-md)] border px-3.5 py-2.5 text-sm transition-colors ${
                          chosen
                            ? "border-brand bg-[var(--brand-soft)] font-semibold text-text"
                            : "border-[var(--line-strong)] bg-surface text-text-2 hover:bg-raised hover:text-text"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`answer-${item.id}`}
                          value={option}
                          checked={chosen}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [item.id]: option }))
                          }
                          className="size-4 accent-[var(--brand)]"
                        />
                        {option}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ) : multiline(item) ? (
            <textarea
              id={`answer-${item.id}`}
              aria-label="Your answer"
              rows={5}
              value={answers[item.id] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))
              }
              placeholder="Your working and your answer"
              className={FIELD}
            />
          ) : (
            <input
              id={`answer-${item.id}`}
              aria-label="Your answer"
              value={answers[item.id] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))
              }
              placeholder="Your answer"
              className={`${FIELD} min-h-11`}
            />
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-text-3">
          Nothing is marked until you finish. Anything left blank counts as not
          solved — a guess you can explain is better than a blank.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || busy}
          >
            <Icon name="chevronRight" size={15} className="rotate-180" />
            Back
          </Button>
          {last ? (
            <Button onClick={finish} loading={busy}>
              {busy ? "Finishing" : "Finish and check"}
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}>
              Next item
              <Icon name="chevronRight" size={15} />
            </Button>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm font-semibold text-brand" role="alert">
            {error}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="rise-in h-full">
      <Badge tone="brand" icon="brainOnly">
        Today&apos;s session
      </Badge>
      <h2 className="mt-3.5 font-display text-xl font-bold">
        Five items, nothing to lean on.
      </h2>
      <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-text-2">
        No hints, no coach, no worked solutions. You will see the verified key
        for every item the moment you finish, and not a second before — so the
        recall has to come from you.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={start} loading={busy}>
          {busy ? "Starting" : "Start brain-only session"}
        </Button>
        <span className="text-sm text-text-3">about 5 minutes</span>
      </div>
      {error && (
        <p className="mt-3 text-sm font-semibold text-brand" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
