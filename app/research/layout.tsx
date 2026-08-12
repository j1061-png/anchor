import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Research · Cognitive Offloading",
  description:
    "Interactive research deck: cognitive offloading and the developing mind, 2011–2026.",
};

export const viewport: Viewport = {
  themeColor: "#0B0A24",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ResearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
