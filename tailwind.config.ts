import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        acid: "#00FF66",
        cyan: "#00F0FF",
      },
      fontFamily: {
        display: ["Syne", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Geist Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        flicker: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".4" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseCore: {
          "0%,100%": { transform: "scale(1)", opacity: ".7" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
      },
      animation: {
        flicker: "flicker 2.5s infinite",
        scan: "scan 6s linear infinite",
        pulseCore: "pulseCore 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
