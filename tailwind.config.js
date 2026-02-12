/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // A vibrant indigo
        secondary: '#64748B', // A muted slate
        accent: '#EC4899', // A complementary pink for highlights
        success: '#22C55E', // Green for success
        error: '#EF4444', // Red for error
        warning: '#F59E0B', // Amber for warning
        info: '#3B82F6', // Blue for info
        main: 'var(--text-main)',
        'text-secondary': 'var(--text-secondary)', // Renamed to avoid conflict with 'secondary'
        active: 'var(--bg-active)',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.12)',
        'medium': '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 16px 48px -8px rgba(0, 0, 0, 0.18)',
        'glow': '0 0 20px -5px rgba(79, 70, 229, 0.4)',
        'glow-success': '0 0 20px -5px rgba(34, 197, 94, 0.4)',
        'glow-error': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          primary: '#4F46E5', // Use the new primary color
          'base-100': '#FFFFFF', // White background
          'base-200': '#F8FAFC', // Light gray for secondary backgrounds
          'base-300': '#E2E8F0', // Even lighter gray for borders/dividers
          'neutral': '#F1F5F9', // Neutral background for components
          'neutral-focus': '#E2E8F0', // Neutral focus state
          'neutral-content': '#334155', // Darker text on neutral
          '--rounded-box': '0.5rem', // Slightly rounded corners
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#4F46E5', // Use the new primary color
          'base-100': '#1E293B', // Dark slate for background
          'base-200': '#0F172A', // Even darker slate for secondary backgrounds
          'base-300': '#334155', // Muted blue-gray for borders/dividers
          'neutral': '#334155', // Neutral background for components
          'neutral-focus': '#475569', // Neutral focus state
          'neutral-content': '#E2E8F0', // Lighter text on neutral
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
    ],
  },
};
