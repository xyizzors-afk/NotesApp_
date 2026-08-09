"use client";

import { useEffect } from "react";
import type { Theme } from "@/lib/local-types";
import { readJSON, STORAGE_KEYS } from "@/lib/storage";
import { useTheme } from "@/lib/local-hooks";

const THEME_ORDER: Theme[] = ["light", "dark", "amoled"];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Honour a saved theme as soon as we mount, in case the inline head script
    // (FOUC guard) hadn't run yet or the preference changed mid-session.
    const saved = readJSON<Theme>(STORAGE_KEYS.theme, "light");
    if (THEME_ORDER.includes(saved) && saved !== "light") applyTheme(saved);
  }, []);

  return <>{children}</>;
}