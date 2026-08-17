"use client";

// Practice picker (§4): choose a category and difficulty. Ratings move,
// XP is halved, the streak is untouched — and the UI says so.
//
// One task, one form: this page is `focused` on purpose.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Page, PageHeader } from "@/components/ui/page";
import { Card, Well } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { WhyThis } from "@/components/ui/why-this";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";

/** What practice does and does not do, said before you start rather than after. */
const RULES: { icon: "target" | "spark" | "flame"; title: string; body: string }[] = [
  {
    icon: "target",
    title: "Ratings move",
    body: "Every answer updates the rating for the category you picked, exactly as the daily five do.",
  },
  {
    icon: "spark",
    title: "Half XP",
    body: "You chose the category and the difficulty, so the work is worth less than a set picked for your weakest areas.",
  },
  {
    icon: "flame",
    title: "The streak is untouched",
    body: "Only the daily session extends your run of days. Practice as much or as little as you like.",
  },
];

export default function PracticePage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("pattern");
  const [difficulty, setDifficulty] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/session/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "practice", category, difficulty }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Could not start practice.");
      router.push(`/session/${d.sessionId}`);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Could not start practice. Try again.");
    }
  };

  return (
    <Page width="focused">
      <PageHeader
        eyebrow="Extra practice"
        title="Pick what to work on."
        lead="Puzzles in one category, at a difficulty you set. Use it when you already know which thing is shaky — the daily five choose for you, this does not."
      />

      <Card className="rise-in">
        <fieldset>
          <legend className="t-eyebrow">Category</legend>
          <div
            role="radiogroup"
            aria-label="Category"
            className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {CATEGORIES.map((c) => {
              const selected = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategory(c)}
                  className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--r-md)] border px-3 py-2.5 text-sm font-semibold transition-all duration-[130ms] ${
                    selected
                      ? "border-transparent bg-text text-canvas shadow-[var(--shadow-xs)]"
                      : "border-[var(--line-strong)] bg-surface text-text-2 hover:bg-raised hover:text-text"
                  }`}
                >
                  {selected && <Icon name="check" size={14} />}
                  {CATEGORY_LABELS[c]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-7">
          <p className="t-eyebrow" id="difficulty-label">
            Difficulty
          </p>
          <div className="mt-3 flex items-center gap-4">
            <Button
              variant="secondary"
              aria-label="Lower difficulty"
              onClick={() => setDifficulty((d) => Math.max(1, d - 1))}
              disabled={difficulty <= 1}
            >
              <Icon name="minus" size={16} />
            </Button>
            <output
              aria-live="polite"
              aria-labelledby="difficulty-label"
              className="num w-14 text-center text-[2rem] leading-none"
            >
              {difficulty}
            </output>
            <Button
              variant="secondary"
              aria-label="Raise difficulty"
              onClick={() => setDifficulty((d) => Math.min(10, d + 1))}
              disabled={difficulty >= 10}
            >
              <Icon name="plus" size={16} />
            </Button>
          </div>
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-text-2">
            <span className="num">1</span> is gentle,{" "}
            <span className="num">10</span> is the hardest the generator makes.
            Pick something you expect to get some of wrong — that is the range
            where practice does anything.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button onClick={start} loading={busy}>
            {busy ? "Setting up" : `Start ${CATEGORY_LABELS[category]} practice`}
          </Button>
          <span className="text-sm text-text-3">
            <span className="num">5</span> puzzles, about{" "}
            <span className="num">8</span> minutes
          </span>
        </div>
        {error && (
          <p className="mt-3 text-sm text-brand" role="alert">
            {error}
          </p>
        )}
      </Card>

      <WhyThis k="desirableDifficulty" className="mt-4" />

      <Well className="mt-8">
        <p className="t-eyebrow">What a practice set counts for</p>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          {RULES.map((rule) => (
            <div key={rule.title}>
              <dt className="flex items-center gap-2 text-sm font-semibold">
                <Icon name={rule.icon} size={15} className="text-text-3" />
                {rule.title}
              </dt>
              <dd className="mt-1.5 text-[0.8125rem] leading-relaxed text-text-2">
                {rule.body}
              </dd>
            </div>
          ))}
        </dl>
      </Well>
    </Page>
  );
}
