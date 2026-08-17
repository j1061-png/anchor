import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadTimeline } from "@/lib/progress-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const body = await loadTimeline(
    user.id,
    Number(profile?.xp ?? 0),
    String(profile?.created_at ?? new Date().toISOString()),
  );

  return NextResponse.json(body, {
    headers: { "cache-control": "private, max-age=30" },
  });
}
