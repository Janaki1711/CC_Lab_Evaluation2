/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bms: {
          bg: '#0a0b0e',
          card: '#12151e',
          elevated: '#1a1e2b',
          border: '#2a3042',
          red: '#e50914',
          crimson: '#dc2626',
          rose: '#f43f5e',
          gold: '#f59e0b',
          amber: '#fbbf24',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
