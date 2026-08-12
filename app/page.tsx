import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/wordmark";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/today");

  const cards = [
    { title: "Attempt before AI", body: "Hints ask questions before answers. The answer never comes first.", color: "#3B82F6" },
    { title: "Grade the process", body: "XP rewards independent solving — not just showing up.", color: "#D69E2E" },
    { title: "Track independence", body: "Six dimensions show where you're offloading vs. doing the work.", color: "#38A169" },
    { title: "Progress ranks", body: "See how you improve against classmates at your level.", color: "#805AD5" },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-8 sm:max-w-xl">
      <header className="flex items-center justify-between">
        <Wordmark />
        <Link href="/auth" className="text-sm font-semibold text-slate hover:text-navy">Sign in</Link>
      </header>

      <section className="flex flex-1 flex-col justify-center py-10">
        <div className="hero-card p-8 text-center deal-in">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-navy text-white">
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <p className="mt-5 text-xs text-slate">Welcome to anchor</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl">
            Say hello before you dive in
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate">
            Five puzzles a day. No help for 45 seconds. Built on cognitive-offloading
            research — the thinking stays in your head.
          </p>

          <Link
            href="/auth?mode=signup"
            className="mt-8 inline-flex w-full items-center justify-center rounded-(--radius-pill) bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-navy/90"
          >
            Start training
          </Link>
        </div>

        <p className="my-6 text-center text-xs text-slate">or start with</p>

        <ul className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <li key={c.title} className="flex flex-col items-center gap-2 rounded-2xl border border-ink/6 bg-chalk p-4 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ background: c.color }}>
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 3v18M3 12h18" strokeLinecap="round" />
                </svg>
              </span>
              <p className="text-center text-xs font-semibold text-navy">{c.title}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="pb-4 text-center text-xs text-slate">
        Built for students who want their working memory back.
      </footer>
    </main>
  );
}
