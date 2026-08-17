"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

type Theme = "light" | "dark";

/** Must match the key read by public/theme.js, which runs before paint. */
export const THEME_KEY = "anchor-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const el = document.documentElement;
    el.classList.toggle("dark", next === "dark");
    el.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode: the toggle still works for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`grid size-9 cursor-pointer place-items-center rounded-full text-text-2 transition-colors hover:bg-raised hover:text-text ${className}`}
    >
      {/* Render nothing meaningful until mounted so SSR and client agree. */}
      {ready && <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />}
    </button>
  );
}
