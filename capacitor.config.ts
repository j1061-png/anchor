import type { CapacitorConfig } from "@capacitor/cli";

// iOS wrapper config — see APP-STORE.md for the full submission plan.
//
// Production ships the static export bundled in the app (webDir: "out");
// pointing server.url at the hosted site in a store build is the classic
// guideline 4.2 "repackaged website" rejection. During development you may
// temporarily add:
//   server: { url: "http://localhost:5730", cleartext: true }
// to live-reload against the dev server — never commit that enabled.
const config: CapacitorConfig = {
  appId: "app.anchor.study",
  appName: "Anchor",
  webDir: "out",
  ios: {
    contentInset: "never",
  },
// Dev-only live preview against the Next dev server (iOS Simulator on your Mac):
//   npm run dev          # terminal 1 — keep running
//   npm run ios:sync:dev # terminal 2 — once, or after native dep changes
//   npm run ios:open     # opens Xcode → pick a simulator → Run (▶)
//
// Physical iPhone: replace 127.0.0.1 with your Mac's LAN IP, e.g.
//   CAP_SERVER_URL=http://192.168.1.42:3000 npm run ios:sync
  ...(process.env.CAP_SERVER_URL
    ? { server: { url: process.env.CAP_SERVER_URL, cleartext: true } }
    : {}),
};

export default config;
