"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolved: "dark",
  setTheme: () => {},
  cycleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("rizki-theme") as Theme) || "system";
}

function getSystemPref(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    const r = stored === "system" ? getSystemPref() : stored;
    setResolved(r);
    applyTheme(r);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = mq.matches ? "dark" : "light";
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted, theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("rizki-theme", t);
    setThemeState(t);
    const r = t === "system" ? getSystemPref() : t;
    setResolved(r);
    applyTheme(r);
  }, []);

  const cycleTheme = useCallback(() => {
    const next: Record<Theme, Theme> = {
      light: "dark",
      dark: "system",
      system: "light",
    };
    setTheme(next[theme]);
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: "system", resolved: "dark", setTheme, cycleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
