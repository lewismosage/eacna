/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3fb',
          100: '#d5e0f2',
          200: '#adc2e6',
          300: '#85a3d9',
          400: '#5d85cc',
          500: '#3566c0',
          600: '#2a529a',
          700: '#1f3d73',
          800: '#15294d',
          900: '#0a1426',
          950: '#050a13',
        },
        secondary: {
          50: '#ebf9f9',
          100: '#d0f0ef',
          200: '#a1e1df',
          300: '#73d1ce',
          400: '#44c2be',
          500: '#2ca8a5',
          600: '#238785',
          700: '#1a6564',
          800: '#114443',
          900: '#092221',
          950: '#041111',
        },
        accent: {
          50: '#fdf9eb',
          100: '#f9f0ce',
          200: '#f2e19d',
          300: '#ecd26c',
          400: '#e6c33b',
          500: '#d4b12b',
          600: '#aa8d22',
          700: '#7f691a',
          800: '#554611',
          900: '#2a2309',
          950: '#151104',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};