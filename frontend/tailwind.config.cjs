/** @type {import('tailwindcss').Config} */
console.log("✅ Tailwind config loaded");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ['gap-4', 'gap-8', 'gap-20'], // forza l'inclusione
  theme: {
    extend: {},
  },
  plugins: [],
}
