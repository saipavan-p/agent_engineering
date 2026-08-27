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
        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ccdacc',
          300: '#a7c1a8',
          400: '#7fa381',
          500: '#608662',
          600: '#4a6b4c',
          700: '#3c553e',
          800: '#324534',
          900: '#2a392c',
          950: '#152016',
        },
        twilight: {
          50: '#f2f4f8',
          100: '#e1e7f0',
          200: '#c7d3e4',
          300: '#9fb5d2',
          400: '#7091bd',
          500: '#5073a5',
          600: '#3d5a89',
          700: '#324970',
          800: '#2b3f5e',
          900: '#28364f',
          950: '#0f172a',
        },
        terracotta: {
          50: '#fdf7f3',
          100: '#faede5',
          200: '#f4d9ca',
          300: '#ebbea4',
          400: '#df9c78',
          500: '#d17d54',
          600: '#bc633f',
          700: '#9c4e33',
          800: '#7f412d',
          900: '#693829',
          950: '#3b1c13',
        },
        sakura: {
          50: '#fdf4f7',
          100: '#fceaf0',
          200: '#fbd4e2',
          300: '#f7b0c9',
          400: '#f080a7',
          500: '#e35987',
          600: '#cf386c',
          700: '#b12654',
          800: '#932247',
          900: '#7b203e',
          950: '#4a0c20',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.12)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      boxShadow: {
        'zen': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'zen-glow': '0 0 35px -5px var(--glow-color, rgba(96, 134, 98, 0.25))',
        'zen-card': '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
