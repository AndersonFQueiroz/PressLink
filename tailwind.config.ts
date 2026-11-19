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
        // Fonte única: canais em `--pl-*` (src/app/globals.css). Os templates
        // públicos continuam com `pl-tpl--*` e com o token `acid`, que é a cor
        // própria do DarkMinimal/Vibrant.
        ink: "rgb(var(--pl-ink) / <alpha-value>)",
        panel: {
          bg: "rgb(var(--pl-ink) / <alpha-value>)",
          surface: "rgb(var(--pl-surface) / <alpha-value>)",
          raised: "rgb(var(--pl-raised) / <alpha-value>)",
          "raised-hover": "rgb(var(--pl-raised-hover) / <alpha-value>)",
          line: "rgb(var(--pl-line) / var(--pl-line-alpha))",
          "line-strong": "rgb(var(--pl-line) / 0.16)",
          text: "rgb(var(--pl-text) / <alpha-value>)",
          muted: "rgb(var(--pl-muted) / <alpha-value>)",
        },
        // Magenta do logo. Preenchimento magenta leva texto `ink` (4,9:1);
        // branco sobre magenta reprova AA (4,08:1).
        signal: {
          DEFAULT: "rgb(var(--pl-signal) / <alpha-value>)",
          hover: "rgb(var(--pl-signal-hover) / <alpha-value>)",
          press: "rgb(var(--pl-signal-press) / <alpha-value>)",
          soft: "rgb(var(--pl-signal-soft) / <alpha-value>)",
        },
        ok: "rgb(var(--pl-ok) / <alpha-value>)",
        warn: "rgb(var(--pl-warn) / <alpha-value>)",
        danger: "rgb(var(--pl-danger) / <alpha-value>)",
        acid: "#d8ff4a",
        stage: "#ff3d8b",
        paper: "#f4efe6",
        vermilion: "#b8472b",
        // Paleta editorial da landing pública (fora do painel): mantida para
        // não quebrar `src/app/page.tsx`.
        lilac: "#efe8fb",
        graphite: "#2a2333",
        plum: "#6d28d9",
        blush: "#f7e8ff",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Títulos, wordmark e poster usam a fonte do logo (Poppins).
        display: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
        poster: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
        "word-up": {
          "0%": { transform: "translate3d(0, 110%, 0) rotate(3deg)", opacity: "0" },
          "100%": { transform: "translate3d(0, 0, 0) rotate(0deg)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(-2deg)" },
          "50%": { transform: "translate3d(0, -14px, 0) rotate(2deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.8" },
        },
        "draw-line": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "70%, 100%": { transform: "scale(1.7)", opacity: "0" },
        },
        "scroll-cue": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(5px)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "marquee-slow": "marquee 52s linear infinite",
        "word-up": "word-up 1s var(--ease-out-expo) both",
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spin 18s linear infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "ping-slow": "ping-slow 2.6s cubic-bezier(0, 0, 0.2, 1) infinite",
        "scroll-cue": "scroll-cue 1.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
