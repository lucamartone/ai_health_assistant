const plugin = require('@tailwindcss/postcss');

module.exports = {
  plugins: [
    plugin,
    require('autoprefixer'),
  ],
};