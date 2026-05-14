/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefbf4',
          100: '#d5f6e3',
          200: '#aeedcb',
          300: '#79dfab',
          400: '#42c986',
          500: '#20ae6b',
          600: '#13a060',
          700: '#0f7046',
          800: '#10593a',
          900: '#0e4931',
        },
        accent: {
          50: '#fef3ec',
          100: '#fde4d1',
          200: '#fac5a3',
          300: '#f6a06a',
          400: '#f2793a',
          500: '#ee5a16',
          600: '#df410c',
          700: '#b92e0c',
          800: '#932612',
          900: '#772212',
        },
        dark: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d8e2',
          300: '#b0b6c8',
          400: '#858ea9',
          500: '#66708f',
          600: '#515976',
          700: '#434960',
          800: '#3a3f51',
          900: '#1e2130',
          950: '#141622',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [],
};
