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
        },
        ink: { 
          900: "var(--ink-900)", 
          600: "var(--ink-600)",
          400: "var(--ink-400)", 
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        teal: "var(--primary)", // Aliased to not break old code immediately
        gold: "var(--primary)", // Aliased
        glass: {
          bg: "var(--glass-bg)",
          border: "var(--glass-border)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-default)",
        lg: "var(--radius-lg)",
        pill: "9999px",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

