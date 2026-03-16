/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        navy: {
          950: "#04070f",
          900: "#070d1a",
          800: "#0d1829",
          700: "#142038",
          600: "#1e3050",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        slate: {
          400: "#94a3b8",
          500: "#64748b",
        }
      }
    },
  },
  plugins: [],
}