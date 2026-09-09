/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        napps: {
          dark: '#0f172a',
          blue: '#0284c7',
          sky: '#38bdf8',
          accent: '#16a34a'
        }
      }
    },
  },
  plugins: [],
}