/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefcf5",
          100: "#d6f7e4",
          200: "#b0eecc",
          300: "#7adeab",
          400: "#43c187",
          500: "#22a76d",
          600: "#158559",
          700: "#136948",
          800: "#12543b",
          900: "#104531",
          950: "#07271c",
        },
      },
    },
  },
  plugins: [],
};
