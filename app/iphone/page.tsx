"use client";

import { useState } from "react";
import Link from "next/link";

// iPhone mode: the whole app inside a phone frame, at a real iPhone viewport
// (393 x 852). The app runs in a same-origin iframe, so media queries render
// the true mobile layout and the signed-in session carries over.
export default function IphoneModePage() {
  const [route, setRoute] = useState("/today");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink px-4 py-8">
      <div className="flex items-center gap-3">
        <p className="font-display text-sm font-bold tracking-tight text-chalk">
          iPhone mode
        </p>
        <Link
          href="/today"
          className="rounded-(--radius-ctl) border border-chalk/40 px-3 py-1 text-xs text-chalk underline-offset-2 hover:underline"
        >
          Exit
        </Link>
      </div>

      <div
        className="relative rounded-[54px] bg-black p-[14px] shadow-2xl"
        style={{ boxShadow: "0 0 0 2px #3a3a3c, 0 24px 80px rgba(0,0,0,.6)" }}
      >
        {/* Dynamic island */}
        <div className="pointer-events-none absolute left-1/2 top-[26px] z-10 h-[24px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
        <iframe
          key={route}
          src={route}
          title="Anchor on iPhone"
          width={393}
          height={852}
          className="rounded-[40px] bg-paper"
          style={{ border: "none" }}
        />
      </div>

      <div className="flex gap-2">
        {[
          ["/today", "Today"],
          ["/learn", "Learn"],
          ["/independence", "Progress"],
          ["/profile", "Profile"],
        ].map(([href, label]) => (
          <button
            key={href}
            type="button"
            onClick={() => setRoute(href)}
            className={`cursor-pointer rounded-(--radius-ctl) border px-3 py-1 text-xs ${
              route === href
                ? "border-gold bg-gold/20 text-chalk"
                : "border-chalk/40 text-chalk/80 hover:text-chalk"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-chalk/60">
        Real iPhone viewport — 393 by 852. Sign-in carries over from the site.
      </p>
    </main>
  );
}
