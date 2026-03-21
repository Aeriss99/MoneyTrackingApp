/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./home.html", "./src/**/*.{js,html}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui"],
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "finance-ink": "#0d1729",
        "finance-deep": "#1f2c47",
        "finance-cyan": "#26c2f3",
        "finance-mint": "#1fd8a4",
        "finance-sand": "#f2c879",
        "finance-bg": "#f4f7fb",
      },
      boxShadow: {
        fintech: "0 1px 2px rgba(15,23,42,.06), 0 12px 35px rgba(15,23,42,.10)",
        glow: "0 18px 50px -28px rgba(15,23,42,.55)",
      },
    },
  },
  plugins: [],
};
