import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://anchor-one-zeta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Anchor — think first",
    template: "%s · Anchor",
  },
  description:
    "Daily training that makes you do the thinking. Five puzzles a day, help that stays locked until you have tried, and a coach that asks instead of answering.",
  applicationName: "Anchor",
  openGraph: {
    type: "website",
    siteName: "Anchor",
    title: "Anchor — think first",
    description:
      "Daily training that makes you do the thinking. Help stays locked until you have tried.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anchor — think first",
    description:
      "Daily training that makes you do the thinking. Help stays locked until you have tried.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0f110d" },
  ],
  width: "device-width",
  initialScale: 1,
  // The native shell draws edge to edge; safe-area padding lives in CSS.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint so there is no flash of
            the wrong one. It must run synchronously and before the body, which
            is exactly what next/script's beforeInteractive is for. The file is
            static and takes no user input. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme.js" />
      </head>
      <body
        className={`${bricolage.variable} ${publicSans.variable} ${martianMono.variable} min-h-dvh antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
