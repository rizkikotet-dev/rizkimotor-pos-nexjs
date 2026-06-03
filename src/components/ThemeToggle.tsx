"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  const label =
    theme === "light"
      ? "Mode terang"
      : theme === "dark"
        ? "Mode gelap"
        : "Ikuti sistem";

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[36px] min-w-[36px]"
      aria-label={`Tema: ${label}. Klik untuk ganti.`}
      title={label}
    >
      {theme === "light" && <Sun className="h-4 w-4" aria-hidden="true" />}
      {theme === "dark" && <Moon className="h-4 w-4" aria-hidden="true" />}
      {theme === "system" && <Monitor className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
