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
        primary: {
          DEFAULT: '#1B3A2D',
          50: '#E8F0EC',
          100: '#D1E1DA',
          200: '#A3C3B5',
          300: '#75A590',
          400: '#47876B',
          500: '#1B3A2D',
          600: '#162F24',
          700: '#11241B',
          800: '#0C1912',
          900: '#070E09',
        },
        secondary: {
          DEFAULT: '#F5F0E8',
          50: '#FDFCFA',
          100: '#FAF7F2',
          200: '#F5F0E8',
          300: '#E8DFD0',
          400: '#DBCEB8',
          500: '#CEBDA0',
        },
        accent: {
          DEFAULT: '#C4A265',
          50: '#FCF9F3',
          100: '#F5ECD9',
          200: '#EBD9B3',
          300: '#E1C68D',
          400: '#D7B367',
          500: '#C4A265',
          600: '#A68545',
          700: '#7D6434',
          800: '#544323',
          900: '#2B2212',
        },
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#7A7A7A',
        },
        card: '#FDFCFA',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(27, 58, 45, 0.08), 0 4px 16px -4px rgba(27, 58, 45, 0.12)',
        'card-hover': '0 8px 24px -4px rgba(27, 58, 45, 0.12), 0 12px 32px -8px rgba(27, 58, 45, 0.16)',
        'button': '0 2px 4px -1px rgba(196, 162, 101, 0.2)',
        'button-hover': '0 4px 12px -2px rgba(196, 162, 101, 0.3)',
      },
      backgroundImage: {
        'grain': "url('/grain.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #1B3A2D 0%, #2D5A45 50%, #1B3A2D 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'spotlight': 'spotlight 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(196, 162, 101, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(196, 162, 101, 0.6)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        spotlight: {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(196, 162, 101, 0.2)' },
          '50%': { boxShadow: '0 0 0 8px rgba(196, 162, 101, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
