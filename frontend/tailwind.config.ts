/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sentinel: {
          900: '#070b14',
          850: '#0c1322',
          800: '#111c33',
          700: '#1c2d52',
          600: '#2b447a',
          500: '#3d63af',
          400: '#5a82d6',
          300: '#86a8ec',
          200: '#b8cef6',
          100: '#e1ecfc'
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#991b1b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
