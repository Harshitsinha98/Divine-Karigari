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
        "gold-light": "#D4A853",
        oxblood: "#7A2530",
        tulsi: "#274B3B",
        "tulsi-light": "#35644D",
        "sand-line": "#DFCFAE",
        "muted-ink": "#706657",
        cream: "#FFF8ED",
        "warm-white": "#FFFBF5",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        soft: "8px",
        "soft-lg": "12px",
        "soft-xl": "16px",
        "soft-2xl": "24px",
        "soft-3xl": "32px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(43, 36, 28, 0.06)",
        lift: "0 14px 34px rgba(43, 36, 28, 0.11)",
        "lift-lg": "0 20px 50px rgba(43, 36, 28, 0.14)",
        glow: "0 0 30px rgba(184, 134, 46, 0.15)",
        "glow-lg": "0 0 60px rgba(184, 134, 46, 0.2)",
        inset: "inset 0 0 0 1px rgba(223, 207, 174, 0.7)",
        glass: "0 8px 32px rgba(43, 36, 28, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
      },
      spacing: { 18: "4.5rem", 22: "5.5rem", 26: "6.5rem", 30: "7.5rem" },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-gold": "linear-gradient(135deg, #b8862e 0%, #d4a853 50%, #b8862e 100%)",
        "gradient-warm": "linear-gradient(135deg, #f6eedf 0%, #ffe8c2 50%, #f6eedf 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
