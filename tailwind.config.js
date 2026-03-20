/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#080a0f",
        surface: "#0f1218",
        surface2: "#161b24",
        border: "#1c2333",
        border2: "#232d3f",
        amber: { DEFAULT: "#f59e0b", light: "#fbbf24", dim: "rgba(245,158,11,0.12)", glow: "rgba(245,158,11,0.3)" },
        emerald: { DEFAULT: "#10b981", dim: "rgba(16,185,129,0.12)" },
        rose: { DEFAULT: "#f43f5e", dim: "rgba(244,63,94,0.12)" },
        sky: { DEFAULT: "#38bdf8", dim: "rgba(56,189,248,0.12)" },
        violet: { DEFAULT: "#a78bfa", dim: "rgba(167,139,250,0.12)" },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        "slide-in": "slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-amber": "pulseAmber 2s infinite",
        "pulse-rose": "pulseRose 1.5s infinite",
        "spin-slow": "spin 2s linear infinite",
        blink: "blink 1.2s ease-in-out infinite",
        rain: "rainFall linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideIn: { from: { opacity: 0, transform: "translateX(100%)" }, to: { opacity: 1, transform: "translateX(0)" } },
        pulseAmber: { "0%,100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.5)" }, "50%": { boxShadow: "0 0 0 8px rgba(245,158,11,0)" } },
        pulseRose: { "0%,100%": { boxShadow: "0 0 0 0 rgba(244,63,94,0.6)" }, "50%": { boxShadow: "0 0 0 10px rgba(244,63,94,0)" } },
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.2 } },
        rainFall: { "0%": { top: "-10%", opacity: 0 }, "10%": { opacity: 0.7 }, "90%": { opacity: 0.7 }, "100%": { top: "110%", opacity: 0 } },
        shimmer: { "0%": { backgroundPosition: "-200% center" }, "100%": { backgroundPosition: "200% center" } },
      },
    },
  },
  plugins: [],
};
