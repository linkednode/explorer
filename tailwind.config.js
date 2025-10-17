/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // A vibrant blue-violet
        secondary: '#8b5cf6', // A rich purple
        accent: '#f472b6', // A bright pink
        neutral: '#4b5563', // A dark gray for text and backgrounds
        'base-100': '#ffffff', // Light background
        'base-200': '#f3f4f6', // Slightly darker light background
        'base-300': '#e5e7eb', // Even darker light background
        info: '#3abff8', // Light blue for info messages
        success: '#36d399', // Green for success messages
        warning: '#fbbd23', // Yellow for warning messages
        error: '#f87272', // Red for error messages
        yes: '#3fb68b', // Keep existing for specific use cases if needed
        no: '#ff5353', // Keep existing for specific use cases if needed
        main: 'var(--text-main)',
        secondary: 'var(--text-secondary)',
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
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f472b6',
          neutral: '#4b5563',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f472b6',
          neutral: '#d1d5db', // Lighter neutral for dark mode text
          'base-100': '#1f2937', // Dark background
          'base-200': '#111827', // Even darker background
          'base-300': '#0f172a', // Deepest dark background
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
      },
    ],
  },
};
