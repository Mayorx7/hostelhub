/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Public.tsx design system ──
        brand: {
          DEFAULT: '#5C2200',
          dark:    '#3a0f00',
          light:   '#7A3010',
        },
        warm: {
          bg:     '#fdf7f4',   // section backgrounds
          border: '#e8dcd7',   // card / divider borders
          muted:  '#b89080',   // secondary text
        },
        // Legacy aliases kept for backward compat
        'primary-brown': '#5C2200',
        'accent-beige':  '#fdf7f4',
        'gold-divider':  '#e8dcd7',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(92 34 0 / 0.06), 0 1px 2px -1px rgb(92 34 0 / 0.04)',
      },
    },
  },
  plugins: [],
};
