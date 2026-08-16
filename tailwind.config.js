/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FAECE7', 100: '#F5C4B3', 200: '#F0997B',
          400: '#D85A30', 600: '#993C1D', 800: '#712B13', 900: '#4A1B0C',
        },
        charcoal: '#2C2C2A',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Archivo"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
