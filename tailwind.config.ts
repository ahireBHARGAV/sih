import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-canvas)",
        foreground: "var(--ink-900)",
        canvas: {
          DEFAULT: "var(--bg-canvas)",
          soft: "var(--bg-canvas-soft)",
        },
        ivory: { 
          DEFAULT: "#F3EEE4", 
          soft: "#FBF7F0" 
        },
        neutral: "#ECEDF0",
        ink: { 
          900: "#211A14", 
          600: "#6B6055",
          400: "#6B6055", // Aliased for any leftover usage
        },
        orange: { 
          300: "#FFE873", 
          500: "#FFDA1F", 
          700: "#CCA800" 
        },
        primary: {
          DEFAULT: "var(--orange-500)",
          hover: "var(--orange-700)",
        },
        teal: "var(--orange-500)", // Aliased to not break old code immediately
        gold: "var(--orange-300)", // Aliased
        blob: {
          orange: "var(--bg-blob-orange)",
          amber: "var(--bg-blob-amber)",
        },
        glass: {
          bg: "var(--glass-bg)",
          border: "var(--glass-border)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

