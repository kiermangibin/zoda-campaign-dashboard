import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zoda: {
          black: "#030706",
          panel: "#0b1210",
          panel2: "#101a16",
          line: "rgba(117, 255, 202, 0.22)",
          mint: "#55cda1",
          mint2: "#74f0bf",
          text: "#f5f7f4",
          muted: "#a9b6af"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Black", "Arial", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        zoda: "0 24px 80px rgba(85, 205, 161, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
