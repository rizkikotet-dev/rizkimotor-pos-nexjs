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
        brand: {
          50: "#fff8f0",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
        ink: {
          DEFAULT: "#1c1917",
          light: "#292524",
          muted: "#57534e",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["4rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display-md": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        "lifted": "0 20px 60px -15px rgba(0,0,0,0.15)",
        "glow": "0 0 30px rgba(249,115,22,0.2)",
        "glow-lg": "0 0 60px rgba(249,115,22,0.15)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
        "brutal": "4px 4px 0px 0px rgba(28,25,23,1)",
        "brutal-sm": "2px 2px 0px 0px rgba(28,25,23,1)",
        "industrial": "0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "grain": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "30%": { transform: "translate(3%, -15%)" },
          "50%": { transform: "translate(12%, 9%)" },
          "70%": { transform: "translate(9%, 4%)" },
          "90%": { transform: "translate(-1%, 7%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in": "slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-subtle": "pulse-subtle 2s infinite ease-in-out",
        "grain": "grain 8s steps(10) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "mesh-1": "radial-gradient(at 40% 20%, rgba(249,115,22,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(234,88,12,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(251,146,60,0.06) 0px, transparent 50%)",
        "mesh-2": "radial-gradient(at 0% 0%, rgba(249,115,22,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(194,65,12,0.1) 0px, transparent 50%)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
