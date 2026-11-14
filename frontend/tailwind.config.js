/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        academic: {
          navy: '#1e3a8a',
          blue: '#2563eb',
          slate: '#334155',
          gold: '#d97706',
        }
      }
    },
  },
  plugins: [],
}
