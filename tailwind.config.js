/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        huella: {
          50:  "#EAF3DE",
          100: "#C0DD97",
          200: "#97C459",
          300: "#78AD3A",
          400: "#639922",
          500: "#4C7D16",
          600: "#3B6D11",
          700: "#2E5A0D",
          800: "#27500A",
          900: "#173404",
        },
        cosecha: {
          50:  "#FAEEDA",
          100: "#FAC775",
          200: "#EF9F27",
          300: "#D68A1A",
          400: "#BA7517",
          500: "#9C6210",
          600: "#854F0B",
          700: "#6E4008",
          800: "#633806",
          900: "#412402",
        },
      },
    },
  },
  plugins: [],
}