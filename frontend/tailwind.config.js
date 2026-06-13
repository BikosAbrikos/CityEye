/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Text (verified contrast, не на opacity) ──
        ink: "#16191D", // primary text
        "ink-2": "#444A52", // secondary text  ~7:1 on canvas
        "ink-3": "#6C727A", // muted / meta     ~4.6:1 on canvas
        // ── Surfaces (light) ──
        canvas: "#F4F2EE", // warm paper, near-zero chroma
        "canvas-2": "#EBE8E2", // sunken
        card: "#FFFFFF",
        line: "#E6E2DB", // hairline borders, warm

        // ── Surfaces (dark) ──
        night: "#0F1216",
        "night-2": "#161A20",
        nightcard: "#1A1F27",
        "night-line": "#272D36",
        "night-ink-2": "#A8AEB7",
        "night-ink-3": "#787F89",

        // ── Brand (actions only) ──
        brand: "#F4A024",
        "brand-press": "#E08F12",
        "brand-ink": "#7A4A05", // amber-on-light text where contrast needed
        amber: "#F4A024", // legacy alias

        // ── Data semantic (traffic light — никогда не CTA) ──
        good: "#2F9E73",
        mid: "#E0901A",
        poor: "#DA4A36",
        accent: "#3E82CF",

        // ── Akimat portal ──
        navy: "#0E1B2C",
        "navy-2": "#15293F",
        "navy-line": "#24384F",
        steel: "#3E82CF",
        "steel-press": "#326FB6",
        slate: "#F1F4F8", // akimat content bg
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,24,28,0.04), 0 8px 28px -8px rgba(21,24,28,0.12)",
        card: "0 1px 2px rgba(21,24,28,0.05), 0 2px 6px -2px rgba(21,24,28,0.08)",
        "card-hover": "0 2px 4px rgba(21,24,28,0.06), 0 12px 28px -8px rgba(21,24,28,0.16)",
        sheet: "0 -10px 40px -12px rgba(21,24,28,0.22)",
        fab: "0 8px 24px -6px rgba(244,160,36,0.55), 0 2px 6px rgba(244,160,36,0.3)",
        ring: "0 0 0 3px rgba(244,160,36,0.35)",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      zIndex: {
        map: "0",
        overlay: "10",
        floating: "20",
        sheet: "30",
        nav: "40",
        modal: "50",
        toast: "60",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.3s ease both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
