/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-forest': '#2E7D32', // Used the requested dark green
      }
    },
  },
  plugins: [],
}
