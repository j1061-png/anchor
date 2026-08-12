import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

/** Shown when required env vars are missing — avoids a cryptic error boundary. */
export function SetupRequired() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
      <Wordmark />
      <div className="plane mt-8 w-full p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-flag/10 text-flag">
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </span>
        <h1 className="mt-4 font-display text-xl font-extrabold text-ink">
          Anchor isn&apos;t configured yet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          The deploy is missing Supabase environment variables. In Vercel → Project →
          Settings → Environment Variables, add{" "}
          <code className="rounded bg-mist px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-mist px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
          <code className="rounded bg-mist px-1 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>,
          then redeploy.
        </p>
        <Link
          href="https://vercel.com/docs/projects/environment-variables"
          className="mt-5 inline-flex text-sm font-semibold text-accent underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Vercel env var docs
        </Link>
      </div>
    </main>
  );
}
