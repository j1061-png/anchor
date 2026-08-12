import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/wordmark";
import { BlockMeter } from "@/components/ui/think-timer";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/today");

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8 sm:px-8">
      <header className="flex items-center justify-between">
        <Wordmark />
        <Link
          href="/auth"
          className="rounded-(--radius-ctl) px-4 py-2.5 text-sm font-semibold text-slate transition-colors hover:bg-mist/60 hover:text-ink"
        >
          Sign in
        </Link>
      </header>

      <section className="flex flex-1 flex-col justify-center py-16 lg:py-24">
        <span className="principle-tag w-fit deal-in">Cognitive offloading research</span>
        <h1 className="page-title mt-4 max-w-3xl deal-in stagger-1">
          Five puzzles.
          <br />
          <span className="text-accent">No help for 45 seconds.</span>
        </h1>
        <p className="page-subtitle mt-6 deal-in stagger-2">
          AI makes work look better and learners worse — unless the thinking stays
          human. Anchor is built on that research: attempt first, fade help, track
          what you do without assistance.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6 deal-in stagger-3">
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center rounded-(--radius-pill) bg-accent px-8 py-4 text-base font-semibold text-chalk shadow-md transition-all hover:bg-accent/90 hover:shadow-lg"
          >
            Start training
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate">
            <BlockMeter filled={11} label="timer, 11 of 16 blocks filled" />
            <span>think first, then help fades in</span>
          </div>
        </div>

        <ul className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Attempt before AI",
              body: "Hints ask questions before answers. The answer never comes first.",
            },
            {
              title: "Grade the process",
              body: "XP rewards independent solving and persistence — not just showing up.",
            },
            {
              title: "Track independence",
              body: "Six dimensions show where you're offloading vs. doing the work yourself.",
            },
            {
              title: "Brain-only practice",
              body: "Scheduled unaided sessions build the skills AI would skip.",
            },
          ].map((item, i) => (
            <li
              key={item.title}
              className={`plane-interactive p-5 deal-in stagger-${Math.min(i + 1, 4)}`}
            >
              <p className="font-display text-sm font-extrabold">{item.title}</p>
              <p className="mt-2 text-sm text-slate">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pb-4 pt-6 text-xs text-slate">
        <span>Built for students who want their working memory back.</span>
        <Link
          href="/about-the-evidence"
          className="font-semibold text-accent hover:underline"
        >
          Read the research
        </Link>
      </footer>
    </main>
  );
}
