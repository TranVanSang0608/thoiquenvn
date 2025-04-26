/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#8A5CF5',
            DEFAULT: '#6942D0',
            dark: '#5535AB',
          },
          success: '#34D399',
          warning: '#F97316',
          danger: '#EF4444',
          neutral: {
            lightest: '#F5F7FA',
            light: '#E5E7EB',
            DEFAULT: '#6B7280',
            dark: '#1F2937',
          }
        },
        fontFamily: {
          sans: ['Roboto', 'sans-serif'],
          heading: ['Montserrat', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }