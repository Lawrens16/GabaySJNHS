import type { Config } from 'tailwindcss';

const config: Config = {
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
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        school: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          gold: '#d97706',
          emerald: '#059669',
          rose: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
