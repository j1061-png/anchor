import Link from "next/link";

export const metadata = { title: "Privacy policy" };

// Public page — linked from the auth screen, the profile, and the App Store
// listing (guideline 5.1.1(i)). Reachable without an account.
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Privacy policy
        </h1>
        <p className="mt-2 text-sm text-slate">
          Effective 14 August 2026 · Applies to the Anchor app and website.
        </p>
      </header>

      <section className="plane p-6">
        <h2 className="font-display text-xl font-extrabold">What we collect</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>Account details.</strong> Your email address, display name,
            optional school name, year group and avatar. If you sign in with
            Google or Apple, we receive your name and email from that provider.
          </li>
          <li>
            <strong>Learning activity.</strong> Your puzzle and problem
            attempts, the working you type, scores, streaks, hint usage,
            confidence ratings and review schedule. This is the product — it is
            how your progress views are built.
          </li>
          <li>
            <strong>Friend connections.</strong> Friend requests you send or
            accept, and challenge results you share.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed">
          We do not collect your precise location, contacts, photos or browsing
          history. There are no ads, no advertising identifiers and no
          third-party tracking or analytics SDKs.
        </p>
      </section>

      <section className="plane p-6">
        <h2 className="font-display text-xl font-extrabold">
          The AI tutor and your answers
        </h2>
        <p className="mt-3 text-sm leading-relaxed">
          On the written problems in <strong>Learn</strong>, Anchor asks for
          your consent the first time AI help would be used and records your
          answer on your account. Until you agree, none of the text you write
          there is sent to our AI provider, DeepSeek. Once you agree, four
          things send it, and each sends only the question, the verified answer
          key and your own words — never your name, email or anything else from
          your profile:
        </p>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>Hints and the tutor.</strong> Your attempts so far and your
            tutor messages, to write the hint or the reply.
          </li>
          <li>
            <strong>The note on a wrong attempt.</strong> The working you typed,
            to name what it suggests went wrong.
          </li>
          <li>
            <strong>End-of-item feedback.</strong> Your final answer and the
            order of your attempts, to phrase three of its five parts. The other
            two are counted by the app, not written by AI.
          </li>
          <li>
            <strong>Explain-it-back.</strong> The explanation you wrote, to
            score the last 40 of its 100 points. The first 60 are scored by the
            app.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed">
          You can turn this off at any time in{" "}
          <strong>Profile → Settings → AI hints and tutor</strong>. Turning it
          off stops all four immediately, on every device signed into your
          account, and the rest of Learn carries on without them: marking is
          done by the app against verified answer keys, never by AI, and the
          worked solution is the stored one, served as written rather than
          generated.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          Two things are worth saying plainly. First, the daily{" "}
          <strong>puzzle</strong> hints and the end-of-session recap are a
          separate feature with a separate route: asking for a puzzle hint sends
          that puzzle and your current in-progress attempt on it, and finishing
          a session sends the puzzle types, times, scores and hint counts from
          that session. No text you have typed is involved, and the switch above
          does not cover them. Second, your attempts are recorded in our own
          database whether AI is on or off — the consent here is about sending
          your work to the AI provider, not about whether Anchor keeps it.
        </p>
      </section>

      <section className="plane p-6">
        <h2 className="font-display text-xl font-extrabold">
          Where your data lives
        </h2>
        <p className="mt-3 text-sm leading-relaxed">
          Your account and learning data are stored with Supabase, our database
          and authentication provider. Data is transmitted over HTTPS and
          protected by row-level security, so an account can only read its own
          records (and what accepted friends choose to share). We do not sell
          your data to anyone.
        </p>
      </section>

      <section className="plane p-6">
        <h2 className="font-display text-xl font-extrabold">
          Deleting your account
        </h2>
        <p className="mt-3 text-sm leading-relaxed">
          You can delete your account at any time from{" "}
          <strong>Profile → Settings → Delete account</strong> inside the app.
          Deletion is immediate and permanent: your account, profile, attempts,
          progress, streaks and friend connections are all erased. Nothing is
          kept in a &quot;deactivated&quot; state.
        </p>
      </section>

      <section className="plane p-6">
        <h2 className="font-display text-xl font-extrabold">Age</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Anchor is designed for secondary-school students aged 13 and over. If
          you are under 13, do not create an account. If you are a parent or
          guardian and believe a child under 13 has an account, contact us and
          we will delete it.
        </p>
      </section>

      <section className="plane p-6">
        <h2 className="font-display text-xl font-extrabold">Contact</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Questions, data requests or reports:{" "}
          <a className="underline" href="mailto:zuki200912345@gmail.com">
            zuki200912345@gmail.com
          </a>
          . See also the <Link className="underline" href="/terms">terms of use</Link>{" "}
          and <Link className="underline" href="/support">support</Link>.
        </p>
      </section>
    </main>
  );
}
