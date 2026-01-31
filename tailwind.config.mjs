import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0a',
          dark: '#121212',
        },
        accent: {
          DEFAULT: '#e5e7eb',
          blue: '#60aaff',
        },
        glass: 'rgba(18,18,18,0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', ...fontFamily.sans],
      },
      borderRadius: {
        xl: '1.125rem', // 18px
        lg: '0.875rem', // 14px
      },
      boxShadow: {
        soft: '0 4px 32px 0 rgba(0,0,0,0.45)',
        glow: '0 0 0 2px #60aaff33',
      },
      backdropBlur: {
        glass: '16px',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        cinematic: '4.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
};
