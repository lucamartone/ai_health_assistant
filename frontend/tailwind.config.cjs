/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}',
                "./src/components/**/*.{js,jsx,ts,tsx}",
                    "./src/pages/**/*.{js,jsx,ts,tsx}"],

  safelist: [{ pattern: /gap-(4|8|20)/ }],
  theme: {
    extend: {},
  },
  plugins: [],
};

