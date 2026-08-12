import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/setup-required";
import { Nav } from "@/components/nav";

// Needs request-time env + auth; static prerender calls createClient() in child
// pages and crashes when Vercel env vars are missing.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_emoji, streak_current")
    .eq("id", user.id)
    .single();

  if (!profile?.display_name) redirect("/onboarding");

  return (
    <div className="min-h-dvh">
      <Nav
        displayName={profile.display_name}
        avatarEmoji={profile.avatar_emoji}
        streak={profile.streak_current}
      />
      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-2 sm:px-6 sm:pt-4">
        {children}
      </main>
    </div>
  );
}
