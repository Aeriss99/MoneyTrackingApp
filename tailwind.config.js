export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
      },
      colors: {
        neo: {
          primary: "#4D96FF",   // Blue
          accent: "#FFD93D",    // Yellow
          success: "#6BCB77",   // Green (Income)
          danger: "#FF6B9D",    // Pink (Expense)
          warning: "#FF8C42",   // Orange
          dark: "#1a1a2e",
          darker: "#121214",
          surface: "#ffffff",
          bg: "#FDFBF7",
          darkSurface: "#232332",
          darkBg: "#121214",
          border: "#1E1E2A",    // Soft black for light mode borders
          darkBorder: "#E5E7EB",// Soft white for dark mode borders
        },
      },
      boxShadow: {
        // Soft Neo-Brutalism Shadows (Bukan hitam pekat, ada sedikit transparansi)
        "soft-neo": "4px 4px 0px 0px rgba(30, 30, 42, 0.8)",
        "soft-neo-sm": "2px 2px 0px 0px rgba(30, 30, 42, 0.8)",
        "soft-neo-lg": "6px 6px 0px 0px rgba(30, 30, 42, 0.8)",
        
        "soft-neo-dark": "4px 4px 0px 0px rgba(229, 231, 235, 0.6)",
        "soft-neo-dark-sm": "2px 2px 0px 0px rgba(229, 231, 235, 0.6)",
        "soft-neo-dark-lg": "6px 6px 0px 0px rgba(229, 231, 235, 0.6)",
      },
      borderWidth: {
        3: "3px",
      },
      transitionProperty: {
        'neo': 'transform, box-shadow, background-color, border-color, color',
      },
      transitionTimingFunction: {
        'neo-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
};
