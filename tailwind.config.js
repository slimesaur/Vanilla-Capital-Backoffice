/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vanilla: {
          main: '#1A2433',
          secondary: '#C8B991',
          black: '#1A1A1A',
          white: '#F8F6F0',
        },
      },
      fontFamily: {
        canela: ['Canela', 'serif'],
        canelaText: ['CanelaText', 'serif'],
        canelaDeck: ['CanelaDeck', 'serif'],
        arpona: ['Arpona', 'sans-serif'],
        interTight: ['Inter Tight', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
