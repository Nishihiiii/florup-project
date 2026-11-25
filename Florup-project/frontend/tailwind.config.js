import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Unbounded', 'sans-serif'],
      },
      colors: {
        ink: '#503e2f',
        olive: '#908e55',
        cream: '#fff0d3',
        card: '#f6e5c3',
        tan: '#ac8e6c',
        pale: '#e8d9bc',
        line: '#c9b88f',
      },
    },
  },
  plugins: [],
};

export default config;