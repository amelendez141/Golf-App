import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral grays - Linear inspired
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Brand
        primary: {
          DEFAULT: '#16352D',
          50: '#E8F0EC',
          100: '#D1E1DA',
          200: '#A3C3B5',
          300: '#75A590',
          400: '#47876B',
          500: '#16352D',
          600: '#122B24',
          700: '#0E211B',
          800: '#0A1712',
          900: '#060D09',
        },
        accent: {
          DEFAULT: '#A88448',
          50: '#FCF9F3',
          100: '#F5ECD9',
          200: '#E8D4AD',
          300: '#DBBC81',
          400: '#CEA455',
          500: '#A88448',
          600: '#866A3A',
          700: '#64502B',
          800: '#42351D',
          900: '#211B0E',
        },
        // Semantic
        success: '#22C55E',
        warning: '#EAB308',
        error: '#EF4444',
        // Surfaces
        surface: {
          primary: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
        },
        // Borders
        border: {
          DEFAULT: '#E5E5E5',
          secondary: '#F5F5F5',
        },
        // Text
        text: {
          DEFAULT: '#171717',
          primary: '#171717',
          secondary: '#525252',
          tertiary: '#737373',
          quaternary: '#A3A3A3',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'sm': ['13px', { lineHeight: '1.5', letterSpacing: '-0.003em' }],
        'base': ['14px', { lineHeight: '1.5', letterSpacing: '-0.006em' }],
        'lg': ['16px', { lineHeight: '1.5', letterSpacing: '-0.011em' }],
        'xl': ['20px', { lineHeight: '1.3', letterSpacing: '-0.017em' }],
        '2xl': ['24px', { lineHeight: '1.2', letterSpacing: '-0.019em' }],
        '3xl': ['28px', { lineHeight: '1.15', letterSpacing: '-0.021em' }],
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'focus': '0 0 0 2px rgba(168, 132, 72, 0.2)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-up': 'fadeUp 200ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'slow': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
