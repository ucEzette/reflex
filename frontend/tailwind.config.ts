import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e74043",
        "primary-dark": "#b02e30",
        "background-dark": "#0B0E14",
        "surface-dark": "#161b22",
        "neon-cyan": "#00F0FF",
        midnight: "#111625",
        "glass-border": "rgba(255, 255, 255, 0.08)",
        "glass-surface": "rgba(255, 255, 255, 0.03)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Outfit", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
