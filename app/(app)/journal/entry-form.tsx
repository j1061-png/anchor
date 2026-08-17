"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

// N4 — writing an entry after a wrong answer. Two questions, both in the
// student's own words: what went wrong, and what to do next time. Nothing is
// generated for them here.

export interface OpenAttempt {
  id: string;
  stem: string;
  tag: string | null;
}

const field =
  "w-full rounded-[var(--r-md)] border border-[var(--line-strong)] bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-text placeholder:text-text-3 transition-colors hover:border-[var(--line-strong)]";

export function JournalForm({
  attempts,
  preselected,
}: {
  attempts: OpenAttempt[];
  preselected: string | null;
}) {
  const router = useRouter();

  const known = attempts.some((entry) => entry.id === preselected);
  const options: OpenAttempt[] =
    preselected && !known
      ? [{ id: preselected, stem: "The item you came from", tag: null }, ...attempts]
      : attempts;

  const [attemptId, setAttemptId] = useState(preselected ?? options[0]?.id ?? "");
  const [wrong, setWrong] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (options.length === 0) {
    return (
      <Card className="h-full">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-raised text-text-3">
            <Icon name="check" size={19} />
          </span>
          <div>
            <p className="font-display text-base font-bold">
              Nothing waiting to be written up.
            </p>
            <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-text-2">
              An entry attaches to a specific answer you got wrong, so this form
              fills itself in after a session that has one. Nothing to do here
              until then — and having none is a good sign, not a missed task.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const save = async () => {
    if (wrong.trim().length === 0) {
      setError("Write what went wrong before saving.");
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/learn/journal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemAttemptId: attemptId,
          whatWentWrong: wrong.trim(),
          whatToDoNext: next.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save the entry.");
      }
      setWrong("");
      setNext("");
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the entry. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="h-full">
      <div className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="journal-attempt"
            className="t-eyebrow block"
          >
            Which one
          </label>
          <select
            id="journal-attempt"
            value={attemptId}
            onChange={(event) => setAttemptId(event.target.value)}
            className={`${field} mt-2 min-h-11 cursor-pointer`}
          >
            {options.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.stem.length > 70 ? `${entry.stem.slice(0, 70)}…` : entry.stem}
                {entry.tag ? ` · ${entry.tag}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="journal-wrong" className="t-eyebrow block">
            What went wrong
          </label>
          <p className="mb-2 mt-1 text-xs leading-relaxed text-text-3">
            Your words, not the app&apos;s. What were you thinking when you
            answered?
          </p>
          <textarea
            id="journal-wrong"
            rows={4}
            value={wrong}
            onChange={(event) => setWrong(event.target.value)}
            placeholder="I read the sign the wrong way round and subtracted instead of adding."
            className={field}
          />
        </div>

        <div>
          <label htmlFor="journal-next" className="t-eyebrow block">
            What to do next time
          </label>
          <p className="mb-2 mt-1 text-xs leading-relaxed text-text-3">
            One concrete move. Optional.
          </p>
          <textarea
            id="journal-next"
            rows={3}
            value={next}
            onChange={(event) => setNext(event.target.value)}
            placeholder="Check the sign before I start rearranging."
            className={field}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} loading={busy}>
            {busy ? "Saving" : "Save entry"}
          </Button>
          {error && (
            <p className="text-sm font-semibold text-brand" role="alert">
              {error}
            </p>
          )}
          {saved && !error && (
            <p
              className="inline-flex items-center gap-1.5 text-sm text-text-2"
              role="status"
            >
              <Icon name="check" size={15} className="text-[var(--green)]" />
              Saved. It comes back if the same mistake does.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
