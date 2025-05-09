// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Aktiviert den 'class'-basierten Dark Mode
  theme: {
    extend: {
      colors: {
        // Primäre App-Farben
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Farben für Light Mode
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#f9fafb',
            tertiary: '#f3f4f6',
          },
          text: {
            primary: '#111827',
            secondary: '#4b5563',
            tertiary: '#6b7280',
          },
          border: {
            primary: '#e5e7eb',
            secondary: '#d1d5db',
          },
        },
        // Farben für Dark Mode
        dark: {
          bg: {
            primary: '#111827',
            secondary: '#1f2937', 
            tertiary: '#374151',
          },
          text: {
            primary: '#f9fafb',
            secondary: '#e5e7eb',
            tertiary: '#d1d5db',
          },
          border: {
            primary: '#374151',
            secondary: '#4b5563',
          },
        },
      },
    },
  },
  plugins: [],
}