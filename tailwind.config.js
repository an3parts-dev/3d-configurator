/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#374151',
          850: '#1f2937',
          950: '#111827',
        }
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};