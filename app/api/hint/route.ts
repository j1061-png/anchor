import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateHint } from "@/lib/ai";
import { PUZZLE_TYPES } from "@/lib/types";

const bodySchema = z.object({
  type: z.enum(PUZZLE_TYPES),
  seed: z.string().min(1).max(64),
  difficulty: z.number().int().min(1).max(10),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  attempt: z.unknown().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to get hints." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad hint request." }, { status: 400 });
  }

  // The user must have actually been served this seed: no free hint farming.
  const { data: session } = await supabase
    .from("sessions")
    .select("id, puzzle_seeds")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const slots = (session?.puzzle_seeds ?? []) as { seed?: string }[];
  const served = Array.isArray(slots) && slots.some((s) => s?.seed === parsed.data.seed);
  if (!served) {
    return NextResponse.json(
      { error: "That puzzle is not in your current session." },
      { status: 403 },
    );
  }

  const hint = await generateHint(parsed.data);
  return NextResponse.json({ hint });
}
