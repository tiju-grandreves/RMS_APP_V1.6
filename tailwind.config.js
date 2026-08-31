/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'open-sans': ['Open Sans', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        // Design System Colors - SEA Events Theme
        primary: {
          DEFAULT: '#395062',  // Main brand color (slate blue)
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#d6dfde',
          300: '#8fa3af',
          400: '#5f7a8c',
          500: '#395062',
          600: '#2d404e',
          700: '#21303a',
          800: '#162027',
          900: '#0a1013',
        },
        accent: {
          DEFAULT: '#02949d',  // Cyan accent
          50: '#e6f7f8',
          100: '#b3e8eb',
          200: '#80d9de',
          300: '#4dcad1',
          400: '#1abbc4',
          500: '#02949d',
          600: '#02767d',
          700: '#01585e',
          800: '#013a3e',
          900: '#001c1f',
        },
        text: {
          DEFAULT: '#1b1d21',  // Primary text
          light: '#6b7280',    // Secondary text
          lighter: '#9ca3af',  // Tertiary text
        },
        badge: {
          orange: '#ff6b35',   // Badge/alert color
          green: '#10b981',    // Success
          red: '#ef4444',      // Error/Rejected
          yellow: '#f59e0b',   // Warning/Pending
        },
        border: {
          DEFAULT: '#d6dfde',  // Default border
          light: '#e5e7eb',    // Light border
          dark: '#9ca3af',     // Dark border
        },
        bg: {
          DEFAULT: '#ffffff',  // White background
          light: '#f8fafc',    // Light background
          card: '#ffffff',     // Card background
        },
      },
      boxShadow: {
        'custom': '0px 0px 6px 0px rgba(0,0,0,0.20)',
        'search': '0px 0px 12px 0.5px rgba(2,148,157,0.20)',
        'card': '0px 0px 9.600000381469727px 0px rgba(128,202,214,0.25)',
      },
    },
  },
  plugins: [],
}