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
