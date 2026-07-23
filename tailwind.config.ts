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
          200: '#B5D8FA',
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
        'card-hover':
          '0 20px 50px -20px rgb(10 10 120 / 0.28), 0 8px 16px -8px rgb(10 10 120 / 0.12)',
        glow: '0 0 40px -8px rgb(79 163 240 / 0.45)',
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
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(1.5deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        'drawer-in': 'drawer-in 0.3s ease-out forwards',
        'backdrop-in': 'backdrop-in 0.2s ease-out forwards',
        'fade-up': 'fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.8s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
      },
    },
  },
} satisfies Config
