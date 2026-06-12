/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#15181C",
        canvas: "#F5F4F1",
        card: "#FFFFFF",
        // тёмная палитра
        night: "#111317",
        nightcard: "#1B1F26",
        amber: "#F4A024",
        good: "#3FA07E",
        mid: "#F4A024",
        poor: "#E1543B",
        accent: "#4A90D9",
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
        soft: "0 8px 30px rgba(21, 24, 28, 0.08)",
        fab: "0 6px 20px rgba(244, 160, 36, 0.45)",
      },
    },
  },
  plugins: [],
};
