#!/usr/bin/env node
/**
 * Capacitor requires webDir (out/) to exist before `cap sync`, even when
 * CAP_SERVER_URL points the app at a live dev server. Writes a tiny stub.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const indexPath = join(outDir, "index.html");

try {
  await access(indexPath);
  process.exit(0);
} catch {
  /* create stub */
}

await mkdir(outDir, { recursive: true });
await writeFile(
  indexPath,
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anchor</title></head><body><p>Anchor — loading…</p><p>If you see this in the simulator, run <code>npm run ios:sync:dev</code> with <code>npm run dev</code> on your Mac.</p></body></html>`,
  "utf8",
);

console.log("Created out/index.html stub for Capacitor sync.");
