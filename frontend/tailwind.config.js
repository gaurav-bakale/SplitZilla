/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FBF7EF",
          100: "#F5EFE4",
          200: "#EBE2D2",
          300: "#DDD0B8",
          400: "#C8B794",
          DEFAULT: "#F5EFE4",
        },
        ink: {
          DEFAULT: "#1B1A17",
          soft: "#3A3631",
          mute: "#6B655C",
          faint: "#A39A8C",
        },
        terracotta: {
          50: "#FBF1EB",
          100: "#F4DACA",
          200: "#E8B99E",
          300: "#D89874",
          400: "#C2704B",
          500: "#A75B39",
          600: "#8B4728",
          DEFAULT: "#C2704B",
        },
        sage: {
          100: "#E3E7DB",
          200: "#C7CFB7",
          300: "#A3AE8D",
          400: "#7A8A6B",
          500: "#5E6E50",
          DEFAULT: "#7A8A6B",
        },
        gold: {
          DEFAULT: "#B88A3E",
          soft: "#D8B574",
        },
        primary: {
          50: "#FBF1EB",
          100: "#F4DACA",
          200: "#E8B99E",
          300: "#D89874",
          400: "#C2704B",
          500: "#A75B39",
          600: "#8B4728",
          700: "#6F371E",
          800: "#532816",
          900: "#371A0E",
          DEFAULT: "#C2704B",
          foreground: "#FBF7EF",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        hand: ['"Caveat"', "cursive"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 8vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        display: ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        editorial: ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
      },
      boxShadow: {
        paper: "0 1px 1px rgba(30,20,10,0.04), 0 6px 12px -4px rgba(70,45,20,0.12), 0 22px 40px -20px rgba(70,45,20,0.18)",
        "paper-lift": "0 2px 2px rgba(30,20,10,0.05), 0 14px 24px -8px rgba(70,45,20,0.18), 0 40px 70px -24px rgba(70,45,20,0.22)",
        "paper-inset": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(70,45,20,0.05)",
        stamp: "0 0 0 1px rgba(27,26,23,0.08), 0 1px 0 rgba(255,255,255,0.7) inset",
      },
      keyframes: {
        "reveal-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 18px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-6px) rotate(1deg)" },
        },
      },
      animation: {
        "reveal-up": "reveal-up 0.9s cubic-bezier(0.2,0.7,0.2,1) both",
        "soft-float": "soft-float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
