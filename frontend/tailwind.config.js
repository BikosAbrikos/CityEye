/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15181C",
        canvas: "#F5F4F1",
        card: "#FFFFFF",
        amber: "#F4A024",
        good: "#3FA07E",
        mid: "#F4A024",
        poor: "#E1543B",
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
      },
    },
  },
  plugins: [],
};
