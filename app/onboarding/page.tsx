import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/setup-required";
import { Wordmark } from "@/components/wordmark";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = { title: "Set up" };

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=%2Fonboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle<{ display_name: string | null }>();

  if (profile?.display_name) redirect("/today");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <header>
        <Wordmark />
      </header>
      <div className="flex flex-1 flex-col justify-center py-8">
        <OnboardingWizard />
      </div>
    </main>
  );
}
