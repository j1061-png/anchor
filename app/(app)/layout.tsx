import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
      {/* Wider layout; sidebar offset on desktop; bottom nav clearance on mobile */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pt-8 lg:ml-64 lg:px-8">
        {children}
      </main>
    </div>
  );
}
