/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0b1929',
        },
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
        },
        emerald: {
          DEFAULT: '#10b981',
          soft: '#ecfdf5',
        },
        amber: {
          DEFAULT: '#f59e0b',
          soft: '#fffbeb',
        },
        rose: {
          DEFAULT: '#f43f5e',
          hover: '#e11d48',
          soft: '#fff1f2',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        pulseRadial: 'pulseRadial 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        beacon: 'beacon 1.5s ease-out infinite',
      },
      keyframes: {
        pulseRadial: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.85' },
        },
        beacon: {
          '0%': { transform: 'scale(0.95)', opacity: '0.9' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
