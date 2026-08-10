import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingLogo } from "@/components/marketing/logo";
import "./marketing.css";

export const metadata: Metadata = {
  title: "Anchor · Lock distractions. Anchor your focus.",
  description:
    "Research-backed training that keeps the thinking human. Attempt first. Hints after. Brain-only work on a schedule.",
};

const DECK_URL =
  "https://cognitive-offloading-presentation.vercel.app/Cognitive_Offloading_Deck.html";

async function maybeRedirectSignedIn() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/today");
  } catch {
    // Missing or invalid env — serve the marketing site.
  }
}

export default async function MarketingHome() {
  await maybeRedirectSignedIn();

  return (
    <div className="mkt-shell">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Anchor home">
          <MarketingLogo size="sm" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <a
            href="#evidence"
            className="hidden text-sm font-semibold text-slate underline decoration-transparent underline-offset-4 hover:text-ink hover:decoration-ink sm:inline"
          >
            Evidence
          </a>
          <a
            href="#product"
            className="hidden text-sm font-semibold text-slate underline decoration-transparent underline-offset-4 hover:text-ink hover:decoration-ink sm:inline"
          >
            How it works
          </a>
          <Link
            href="/auth"
            className="rounded-(--radius-ctl) px-3 py-2 text-sm font-semibold underline decoration-slate underline-offset-4 hover:decoration-ink"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero — brand, one line, one sentence, one CTA */}
        <section className="mkt-hero-plane">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-20 pt-10 text-center">
            <div className="mkt-mark-in">
              <MarketingLogo size="hero" withTagline />
            </div>
            <h1 className="mkt-reveal mt-10 max-w-2xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-[var(--mkt-navy)] sm:text-4xl">
              AI makes the work better and the learner worse, unless the thinking stays human.
            </h1>
            <p
              className="mkt-reveal mt-5 max-w-lg text-base text-slate sm:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              Anchor is daily training built from the cognitive-offloading
              research: attempt first, hints that never hand over the answer,
              and scheduled brain-only work.
            </p>
            <div
              className="mkt-reveal mt-10 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: "140ms" }}
            >
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center rounded-full border border-[var(--mkt-navy)] bg-[var(--mkt-navy)] px-7 py-3.5 font-semibold text-chalk hover:bg-[var(--mkt-navy)]/90"
              >
                Start training
              </Link>
              <a
                href="#evidence"
                className="inline-flex items-center rounded-full border border-ink/25 bg-chalk/70 px-6 py-3.5 font-semibold text-ink hover:border-ink"
              >
                See the evidence
              </a>
            </div>
          </div>
        </section>

        {/* Concept */}
        <section className="mx-auto max-w-3xl px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mkt-blue)]">
            The concept
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--mkt-navy)] sm:text-4xl">
            You are already doing it
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            Cognitive offloading means moving thinking outside your head. A
            shopping list. A calculator. Sat-nav. All normal. All useful.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate">
            The catch, known since 2011: if you expect to look something up
            later, you remember the thing less and where to find it more. That
            is the Google effect. Generative AI is the first tool that can
            offload the whole chain: framing, reasoning, judgement, production.
          </p>
          <p className="mkt-cite mt-6">
            Sparrow, Liu &amp; Wegner, 2011 · Risko &amp; Gilbert, 2016
          </p>
        </section>

        <div className="mkt-rule mx-auto max-w-5xl" />

        {/* Baseline stats — not a card grid of features */}
        <section className="mx-auto max-w-5xl px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mkt-blue)]">
            The baseline
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-[var(--mkt-navy)] sm:text-4xl">
            Adoption already happened
          </h2>
          <p className="mt-4 max-w-xl text-slate">
            This is not a forecast. Students are already there, faster than
            social media moved.
          </p>

          <dl className="mt-12 grid gap-10 sm:grid-cols-3">
            <div>
              <dt className="mkt-stat text-5xl font-semibold">86%</dt>
              <dd className="mt-3 text-sm leading-relaxed text-slate">
                of U.S. children aged 9–17 now use AI
                <span className="mt-1 block text-xs italic">
                  Common Sense Media, 2026 · n=1,204
                </span>
              </dd>
            </div>
            <div>
              <dt className="mkt-stat text-5xl font-semibold">85%</dt>
              <dd className="mt-3 text-sm leading-relaxed text-slate">
                of those users apply it to schoolwork
                <span className="mt-1 block text-xs italic">
                  48% weekly · 21% every day
                </span>
              </dd>
            </div>
            <div>
              <dt className="mkt-stat text-5xl font-semibold">94%</dt>
              <dd className="mt-3 text-sm leading-relaxed text-slate">
                of UK undergraduates use it for assessed work
                <span className="mt-1 block text-xs italic">
                  HEPI, 2026 · up from 53% in 2024
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <div className="mkt-rule mx-auto max-w-5xl" />

        {/* Core finding */}
        <section id="evidence" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mkt-blue)]">
            The core finding · randomised controlled trial
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--mkt-navy)] sm:text-4xl">
            The work looks better. The learner gets worse.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            Roughly 1,000 Turkish high-school maths students were randomised to
            unguarded GPT-4, a guardrailed tutor, or no AI at all.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div className="border-t border-ink/15 pt-5">
              <p className="mkt-stat text-5xl font-semibold text-[var(--mkt-blue)]">
                +48%
              </p>
              <p className="mt-2 text-sm text-slate">
                While practising with unguarded AI, performance jumped versus
                students who never had it.
              </p>
            </div>
            <div className="border-t border-ink/15 pt-5">
              <p className="mkt-stat text-5xl font-semibold text-flag">−17%</p>
              <p className="mt-2 text-sm text-slate">
                On the later exam with AI removed, those same students scored
                below peers who never used it, and reported no sense that
                learning had suffered.
              </p>
            </div>
          </div>
          <p className="mkt-cite mt-8">
            Bastani et al., PNAS (2025). Generative AI without guardrails can
            harm learning.
          </p>
          <p className="mt-4 text-sm text-slate">
            Where this is weak: one country, one subject, one age group. Strongest
            design in the literature; narrowest sample. It has not been
            replicated in essay writing or with younger children.
          </p>
        </section>

        <div className="mkt-rule mx-auto max-w-5xl" />

        {/* Hope / design */}
        <section className="mx-auto max-w-3xl px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mkt-blue)]">
            The hopeful slide
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--mkt-navy)] sm:text-4xl">
            The tool is not the problem. The design is.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            Across 19 studies, learning gains were about 18× larger when a
            teacher stayed in the student–AI loop versus students left alone
            with the same tool.
          </p>
          <ol className="mt-10 space-y-5 text-base text-ink">
            <li className="flex gap-4">
              <span className="mkt-stat text-xl text-[var(--mkt-blue)]">1</span>
              <span>
                <strong className="font-semibold">Grade the process, not the product.</strong>{" "}
                <span className="text-slate">
                  Change the payoff for unaided work.
                </span>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="mkt-stat text-xl text-[var(--mkt-blue)]">2</span>
              <span>
                <strong className="font-semibold">Attempt before AI.</strong>{" "}
                <span className="text-slate">
                  Productive struggle first; help after.
                </span>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="mkt-stat text-xl text-[var(--mkt-blue)]">3</span>
              <span>
                <strong className="font-semibold">Schedule brain-only work.</strong>{" "}
                <span className="text-slate">
                  Mandate unaided practice the way aviation mandates hand-flying.
                </span>
              </span>
            </li>
          </ol>
          <p className="mkt-cite mt-8">
            Gu &amp; Yan (2025) · Kestin et al. (2025) · Kapur (2008) · Bastani
            et al. (2025)
          </p>
        </section>

        <div className="mkt-rule mx-auto max-w-5xl" />

        {/* Product mapping */}
        <section id="product" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mkt-blue)]">
            What Anchor does with that
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--mkt-navy)] sm:text-4xl">
            Scaffold, don&apos;t substitute
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            Use AI when it helps you think. Don&apos;t use AI instead of
            thinking. The app is the research recommendations turned into a
            daily habit.
          </p>
          <ul className="mt-10 space-y-6">
            <li className="border-t border-ink/15 pt-5">
              <p className="font-display text-xl font-extrabold text-[var(--mkt-navy)]">
                Attempt-first engine
              </p>
              <p className="mt-2 text-slate">
                No hint until you submit an initial answer. The struggle is the
                mechanism. We do not remove it.
              </p>
            </li>
            <li className="border-t border-ink/15 pt-5">
              <p className="font-display text-xl font-extrabold text-[var(--mkt-navy)]">
                Guardrailed tutor
              </p>
              <p className="mt-2 text-slate">
                Hints release step by step, never the finished answer on demand.
                Grounded against verified solutions.
              </p>
            </li>
            <li className="border-t border-ink/15 pt-5">
              <p className="font-display text-xl font-extrabold text-[var(--mkt-navy)]">
                Brain-only sessions
              </p>
              <p className="mt-2 text-slate">
                Scheduled unaided practice so independence is measured, not
                assumed.
              </p>
            </li>
          </ul>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden border-t border-ink/15">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_360px_at_50%_0%,color-mix(in_srgb,var(--mkt-blue)_18%,transparent),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
            <MarketingLogo size="lg" withTagline />
            <p className="mx-auto mt-8 max-w-md text-lg text-slate">
              Five puzzles a day. Thinking stays yours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center rounded-full border border-[var(--mkt-navy)] bg-[var(--mkt-navy)] px-7 py-3.5 font-semibold text-chalk hover:bg-[var(--mkt-navy)]/90"
              >
                Start training
              </Link>
              <a
                href={DECK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-ink/25 bg-chalk/70 px-6 py-3.5 font-semibold text-ink hover:border-ink"
              >
                Full research deck
              </a>
            </div>
            <p className="mt-10 text-xs text-slate">
              Research by Malek Zahran &amp; Abdallah El Dessouky · 22 sources ·
              9 peer-reviewed studies · 2011–2026
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10 px-5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>Anchor. Lock distractions. Anchor your focus.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#evidence" className="underline underline-offset-2 hover:text-ink">
              Evidence
            </a>
            <a
              href={DECK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              Research deck
            </a>
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
              Terms
            </Link>
            <Link href="/support" className="underline underline-offset-2 hover:text-ink">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
