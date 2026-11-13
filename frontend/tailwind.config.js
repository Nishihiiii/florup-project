/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        florup: {
          ink: '#503e2f',
          olive: '#908e55',
          cream: '#fff0d3',
          card: '#f6e5c3',
          tan: '#ac8e6c',
          pale: '#e8d9bc',
          line: '#c9b88f',
        },
      },
      fontFamily: { display: ['Unbounded', 'sans-serif'] },
    },
  },
  plugins: [],
};
