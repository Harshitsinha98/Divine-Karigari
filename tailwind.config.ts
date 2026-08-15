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
        // Light surfaces (kept token names; values switched to a clean white base)
        parchment: "#FFFFFF",
        cream: "#F4FBFA",
        "warm-white": "#FFFFFF",
        "sand-line": "#E3E8E6",
        // Text
        ink: "#15302B",
        "muted-ink": "#5C6B66",
        // Primary accent -> pink/magenta
        gold: "#E11D74",
        "gold-light": "#F472B6",
        // Secondary accent -> rose
        oxblood: "#BE185D",
        // Brand -> teal
        tulsi: "#0E7C6F",
        "tulsi-light": "#14A093",
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
        glow: "0 0 30px rgba(225, 29, 116, 0.16)",
        "glow-lg": "0 0 60px rgba(225, 29, 116, 0.22)",
        inset: "inset 0 0 0 1px rgba(227, 232, 230, 0.9)",
        glass: "0 8px 32px rgba(43, 36, 28, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
      },
      spacing: { 18: "4.5rem", 22: "5.5rem", 26: "6.5rem", 30: "7.5rem" },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-gold": "linear-gradient(135deg, #E11D74 0%, #F472B6 50%, #E11D74 100%)",
        "gradient-warm": "linear-gradient(135deg, #ffffff 0%, #ecfbf8 50%, #ffffff 100%)",
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
