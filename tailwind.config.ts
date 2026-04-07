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
        green: {
          950: "#0a1a0a",
          900: "#1a2e1a",
          800: "#243824",
          700: "#2e4a2e",
          600: "#3a5c3a",
          500: "#4a7a4a",
        },
        gold: {
          950: "#3a2a0a",
          900: "#5a4010",
          800: "#8a6420",
          700: "#b08030",
          600: "#c9a84c",
          500: "#d4b860",
          400: "#e0cc80",
          300: "#ecd9a0",
        },
        cream: "#f5efe0",
        parchment: "#f0e8d0",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        display: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "green-texture": "linear-gradient(135deg, #1a2e1a 0%, #243824 50%, #1a2e1a 100%)",
      },
      animation: {
        "fade-in": "fadeIn 1.5s ease-in-out",
        "slide-up": "slideUp 0.8s ease-out",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
