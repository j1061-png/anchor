import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/setup-required";
import { Wordmark } from "@/components/wordmark";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = { title: "Sign in" };

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  callback: "Sign-in didn't finish. Try again.",
  reset_expired: "That reset link has expired. Request a new one from the sign-in form.",
};

const NOTICES: Record<string, string> = {
  deleted: "Your account and all its data have been deleted.",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/today");

  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : (v ?? "");

  const mode = first(params.mode) === "signup" ? "signup" : "signin";
  const next = first(params.next);
  const refCode = first(params.ref);
  const errorCode = first(params.error);
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.callback) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <header>
        <Link href="/" aria-label="Anchor home">
          <Wordmark />
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="hero-card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </span>
            <p className="mt-3 text-xs text-slate">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-navy">
              {mode === "signup" ? "Join anchor" : "Sign in"}
            </h1>
          </div>
          <AuthForm
            initialMode={mode}
            next={next}
            refCode={refCode}
            errorMessage={errorMessage}
          />
        </div>
        <p className="mt-4 text-center text-xs text-slate">
          Five puzzles a day. The first 45 seconds are yours alone.
        </p>
        {NOTICES[first(params.deleted) ? "deleted" : ""] ? (
          <p className="mt-2 text-center text-xs" role="status">{NOTICES.deleted}</p>
        ) : null}
      </div>

      <footer className="flex justify-center gap-4 pb-2 text-xs text-slate">
        <Link className="underline" href="/privacy">Privacy</Link>
        <Link className="underline" href="/terms">Terms</Link>
        <Link className="underline" href="/support">Support</Link>
      </footer>
    </main>
  );
}
