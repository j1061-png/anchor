import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasAiConsent, setAiConsent } from "@/lib/ai-consent";

// GET/POST /api/consent — the AI consent switch (App Store guideline 5.1.2(i)).
//
// The client caches the answer in localStorage so the learn screen can render
// without waiting, but this route is the source of truth: every model call in
// `/api/learn` reads the column this writes, and a client that lies about its
// cache changes nothing on the server.
//
// The write goes through the service role rather than a column grant. If
// `authenticated` could update `ai_consent_at` directly, an account could stamp
// its own consent without the card ever being shown, which is the thing the
// column exists to evidence.

const bodySchema = z.object({ granted: z.boolean() });

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  return NextResponse.json({ granted: await hasAiConsent(user.id) });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Say whether AI help is on or off." },
      { status: 400 },
    );
  }

  const result = await setAiConsent(user.id, parsed.data.granted);
  if (!result.ok) {
    return NextResponse.json(
      { error: "That setting didn't save. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ granted: parsed.data.granted, consentedAt: result.consentedAt });
}
