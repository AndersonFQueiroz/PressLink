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
        ink: "#17131f",
        plum: "#6d28d9",
        blush: "#f7e8ff",
        paper: "#f4efe6",
        acid: "#d8ff4a",
        stage: "#ff3d8b",
        vermilion: "#b8472b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        poster: ["var(--font-anton)", "Impact", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
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
