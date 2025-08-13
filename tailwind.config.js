/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#1E40AF',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#1E3A8A',
        },
        accent: {
          500: '#F59E0B',
          600: '#D97706',
        },
        text: {
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          900: '#111827',
        },
        bg: {
          100: '#F9FAFB',
          200: '#F3F4F6',
        },
        border: '#E5E7EB',
        info: {
          300: '#93C5FD',
        },
      },
      fontFamily: {
        heading: ['Rubik', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'sans-serif'],
        body: ['Roboto', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'sans-serif'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['2rem', { lineHeight: '1.25', fontWeight: '700' }],
        h2: ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
