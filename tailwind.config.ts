import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand: Burnt Orange. Light uses 600, dark uses 400 — both pass WCAG AA/AAA.
        primary: {
          DEFAULT: "var(--primary)",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#c2410c",
          700: "#9a3412",
          800: "#7c2d12",
          900: "#531800",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        // Slate (neutral) — replaces the hard zinc usage in CSS overrides.
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Semantic surface tokens — all defined as CSS vars in globals.css.
        surface: {
          base: "var(--surface-base)",
          "container-lowest": "var(--surface-container-lowest)",
          "container-low": "var(--surface-container-low)",
          container: "var(--surface-container)",
          "container-high": "var(--surface-container-high)",
          "container-highest": "var(--surface-container-highest)",
          outline: "var(--surface-outline)",
          "outline-variant": "var(--surface-outline-variant)",
        },
        // Semantic state colors — used by badges, alerts, indicators.
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
        // Explicit zinc tokens (kept for components that use bg-zinc-*/text-zinc-*
        // — the CSS overrides in globals.css remap them to semantic vars).
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        // Amber retained for one accent purpose (motor/warmth pairing).
        amber: {
          DEFAULT: "var(--amber)",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        // Emerald kept for legacy admin stat colors (top products, etc.).
        emerald: {
          DEFAULT: "var(--emerald)",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        red: {
          DEFAULT: "var(--red)",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        // Bound to CSS variables injected by next/font in app/layout.tsx
        sans: ['var(--font-geist)', "system-ui", "-apple-system", "sans-serif"],
        mono: ['var(--font-geist-mono)', "ui-monospace", "monospace"],
        display: ['var(--font-geist)', "system-ui", "sans-serif"],
        heading: ['var(--font-jakarta)', 'var(--font-geist)', "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "12px",
        "2xl": "16px",
      },
      // Elevation scale — light mode uses subtle slate-tinted shadows,
      // dark mode uses stronger black-based shadows via CSS overrides.
      boxShadow: {
        none: "none",
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        sm: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 1px rgba(15, 23, 42, 0.02)",
        DEFAULT: "0 2px 4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
        md: "0 4px 12px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.03)",
        lg: "0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)",
        xl: "0 20px 50px rgba(15, 23, 42, 0.10), 0 8px 16px rgba(15, 23, 42, 0.05)",
        "inner-sm": "inset 0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        "focus-ring": "0 0 0 3px rgba(99, 102, 241, 0.18)",
      },
      zIndex: {
        dropdown: "50",
        sticky: "60",
        "modal-backdrop": "70",
        modal: "80",
        toast: "90",
        tooltip: "100",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        "pulse-subtle": "pulse-subtle 2s infinite ease-in-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "slide-out-right": "slide-out-right 0.15s ease-in",
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
