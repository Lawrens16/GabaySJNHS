import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        // Brand Specific Tailored Tokens
        gabay: {
          green: {
            DEFAULT: '#51ae44',
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#61c753',
            500: '#51ae44',
            600: '#3f9334',
            700: '#2f7426',
            800: '#265d20',
            900: '#204d1c',
            950: '#0d2b0c',
          },
          navy: {
            DEFAULT: '#0d14a6',
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#3b4cca',
            600: '#1d2bbd',
            700: '#0d14a6',
            800: '#0a1085',
            900: '#070b61',
            950: '#04073d',
          },
          canvas: {
            light: '#F8FAF6',
            dark: '#0B111A',
            cardLight: '#FFFFFF',
            cardDark: '#121D2B',
          }
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
