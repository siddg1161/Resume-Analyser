/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void: "#050508",
        surface: "#0d0d14",
        card: "#13131e",
        border: "#1e1e2e",
        accent: "#7c6af7",
        "accent-glow": "#a78bfa",
        "accent-2": "#34d399",
        "accent-3": "#fb923c",
        muted: "#6b7280",
        bright: "#f0eeff",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(124,106,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
