"use client";

import { Button } from "@/components/ui/button";

function isSetupError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("supabase is not configured") ||
    msg.includes("supabaseurl is required") ||
    msg.includes("supabase_not_configured")
  );
}

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (isSetupError(error)) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        <div className="plane w-full p-8">
          <h1 className="font-display text-xl font-extrabold text-ink">
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
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="plane w-full max-w-sm p-6 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Something broke on our side.
        </h1>
        <p className="mt-2 text-sm text-slate">
          Reload, and if it happens twice tell us.
        </p>
        <Button className="mt-5" onClick={reset}>
          Reload
        </Button>
      </div>
    </main>
  );
}
