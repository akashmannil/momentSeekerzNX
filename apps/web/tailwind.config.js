/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./apps/web/src/**/*.{html,ts}', './libs/ui/src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vertex3D surface palette — pure black base
        obsidian: {
          50:  '#f4f4f6',
          100: '#e8e8ec',
          200: '#c4c4cc',
          300: '#8c8c9a',
          400: '#5c5c6a',
          500: '#3c3c4a',
          600: '#24242e',
          700: '#181820',
          800: '#101018',
          900: '#08080e',
          950: '#000000', // pure black
        },
        // Vertex3D accent — color.surface.muted
        gold: {
          400: '#de4758',
          500: '#c73847',
          600: '#a82e3e',
        },
      },
      fontFamily: {
        // Vertex3D: Inter for every surface
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        // Vertex3D radius tokens
        'pill':    '99px',
        'pill-sm': '50px',
      },
      animation: {
        'fade-in':  'fadeIn  0.5s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-up':  'fadeUp  0.5s cubic-bezier(0.4,0,0.2,1) forwards',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                              to: { opacity: '1' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' },    to: { opacity: '1', transform: 'scale(1)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      transitionDuration: {
        '350':  '350ms',
        '1200': '1200ms',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
};
