/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        card: "#111827",
        surface: "#070b17",
        "surface-elevated": "#11182b",
        accent: "#a855f7",
        "accent-muted": "#9333ea"
      }
    }
  },
  plugins: []
};
