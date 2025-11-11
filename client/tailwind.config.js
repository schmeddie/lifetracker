/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette as specified
        'primary-bg': '#FFFFFF',
        'primary-text': '#1D2C3B',
        'accent': '#8194A8',
        'secondary-text': '#3E4B58',
        'divider': '#E3E3F1',
        'hover-bg': '#BDD5EA',
      },
    },
  },
  plugins: [],
};
