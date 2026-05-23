/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#111111',
        'surface-raised': '#1A1A1A',
        border: '#2A2A2A',
        'border-bright': '#3A3A3A',
        primary: '#4ADE80',
        'primary-dim': '#16532D',
        accent: '#FB923C',
        'accent-dim': '#7C2D12',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A3A3A3',
        'text-tertiary': '#525252',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
      letterSpacing: {
        heading: '-0.02em',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
};
