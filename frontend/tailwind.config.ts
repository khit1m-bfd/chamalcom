import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-gradient-primary',
    'bg-gradient-gold',
    'bg-gradient-hero',
    'text-primary',
    'bg-primary',
    'bg-teal',
    'bg-gold',
  ],
  theme: {
    extend: {
      colors: {
        // ── ChamalCom Design System ──────────────────────────────────
        primary: {
          DEFAULT: '#0A3D6B',
          mid: '#1A5CA8',
          lt: '#4A90D9',
          foreground: '#FFFFFF',
        },
        gold: {
          DEFAULT: '#E8B84B',
          dark: '#C49A2C',
          foreground: '#0A3D6B',
        },
        teal: {
          DEFAULT: '#0B7A6E',
          lt: '#1DAA9A',
          foreground: '#FFFFFF',
        },
        sand: {
          DEFAULT: '#F5F0E8',
          md: '#E8E2D8',
          dark: '#D4CEC4',
        },
        // ── shadcn/ui tokens ─────────────────────────────────────────
        background: '#F5F0E8',
        foreground: '#0A3D6B',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0A3D6B',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0A3D6B',
        },
        secondary: {
          DEFAULT: '#E8E2D8',
          foreground: '#0A3D6B',
        },
        muted: {
          DEFAULT: '#E8E2D8',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#E8B84B',
          foreground: '#0A3D6B',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#D4CEC4',
        input: '#D4CEC4',
        ring: '#1A5CA8',
        // Status colors
        success: {
          DEFAULT: '#0B7A6E',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        arabic: ['Noto Kufi Arabic', 'sans-serif'],
        body: ['Cairo', 'sans-serif'],
        sans: ['Cairo', 'sans-serif'],
      },
      fontSize: {
        base: ['16px', { lineHeight: '1.7' }],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(10, 61, 107, 0.08)',
        'card-hover': '0 8px 24px rgba(10, 61, 107, 0.15)',
        modal: '0 20px 60px rgba(10, 61, 107, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A3D6B 0%, #1A5CA8 100%)',
        'gradient-gold': 'linear-gradient(135deg, #E8B84B 0%, #C49A2C 100%)',
        'gradient-hero': 'linear-gradient(180deg, rgba(10,61,107,0.6) 0%, rgba(10,61,107,0.3) 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
