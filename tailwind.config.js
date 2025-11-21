/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        "primary": "#7f0df2",
        "background-light": "#f8fafc",
        "background-dark": "#191022",
        "primary-soft": "#E9E7FF",
        "text-primary-dark": "#2D3748",
        "text-secondary-dark": "#718096",
        "border-soft": "#e2e8f0",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
};
