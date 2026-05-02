/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:   '#0A0F1E',
        dark:   '#0D1B2A',
        card:   '#111827',
        border: '#1E2D45',
        cyan:   '#00E5FF',
        gold:   '#FFB800',
        pink:   '#FF3D71',
        violet: '#7C3AED',
        green:  '#00D68F',
        dim:    '#64748B',
      },
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glow:   { '0%,100%': { boxShadow: '0 0 8px #00E5FF33' }, '50%': { boxShadow: '0 0 24px #00E5FF55' } },
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease forwards',
        'glow':    'glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
