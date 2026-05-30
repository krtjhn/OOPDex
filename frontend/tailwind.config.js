/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: '#F43F5E', // Nintendo Red/Rose action
          purple: '#7C3AED', // Primary Purple
          lavender: '#A78BFA', // Secondary
          dark: '#0F0F23', // Deep Background
          text: '#E2E8F0', // Neutral Text
        }
      },
      fontFamily: {
        sans: ['VT323', 'monospace'],
        pixel: ['"Press Start 2P"', 'cursive'],
        display: ['"Press Start 2P"', 'cursive'],
        'exo-2': ['Exo 2', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}