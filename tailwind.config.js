/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1e1e1e',
        'dark-sidebar': '#252526',
        'dark-panel': '#2d2d30',
        'dark-border': '#3e3e42',
        'dark-text': '#cccccc',
        'dark-text-secondary': '#969696',
        'accent-blue': '#007acc',
        'accent-green': '#4ec9b0',
        'accent-orange': '#ce9178',
      },
    },
  },
  plugins: [],
}
