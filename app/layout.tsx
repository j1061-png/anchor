import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Anchor",
    template: "%s · Anchor",
  },
  description: "Five puzzles a day. No help for the first 45 seconds.",
};

export const viewport: Viewport = {
  themeColor: "#f4f2ec",
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
    <html lang="en">
      <body
        className={`${bricolage.variable} ${publicSans.variable} ${martianMono.variable} min-h-dvh antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
