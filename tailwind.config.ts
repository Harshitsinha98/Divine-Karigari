import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        parchment: "#F6EEDF",
        ink: "#2B241C",
        gold: "#B8862E",
        oxblood: "#7A2530",
        tulsi: "#274B3B",
        "sand-line": "#DFCFAE",
        "muted-ink": "#706657",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: { soft: "8px", "soft-lg": "12px", "soft-xl": "16px" },
      boxShadow: {
        soft: "0 8px 24px rgba(43, 36, 28, 0.06)",
        lift: "0 14px 34px rgba(43, 36, 28, 0.11)",
        inset: "inset 0 0 0 1px rgba(223, 207, 174, 0.7)",
      },
      spacing: { 18: "4.5rem", 22: "5.5rem", 26: "6.5rem", 30: "7.5rem" },
    },
  },
  plugins: [],
};
export default config;
