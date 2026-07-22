import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        cnss: {
          900: '#0A0A78',
          800: '#0F0F8C',
          700: '#14149E',
          600: '#2A3DB8',
          500: '#4A63D6',
          400: '#4FA3F0',
          300: '#7DBEF5',
          100: '#E8F2FE',
          50: '#F5F9FF',
        },
        statut: {
          enAttente: '#F5A623',
          rejetee: '#E5484D',
          validee: '#2FA86A',
        },
      },
      fontFamily: {
        display: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(10 10 120 / 0.06), 0 1px 2px -1px rgb(10 10 120 / 0.06)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        'drawer-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'backdrop-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'drawer-in': 'drawer-in 0.3s ease-out forwards',
        'backdrop-in': 'backdrop-in 0.2s ease-out forwards',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
} satisfies Config
