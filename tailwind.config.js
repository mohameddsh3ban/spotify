/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#121212',
        spotify: {
          green: {
            dark: "#00008B",
            light: "#0000FF",
            lighter: "#800080",
          },
          black: "#121212",
          lightBlack: "#222222",
          shadeBlack: "#121212",
          white: "#FFFFFF",
          auth: {
            black: '#0a1a2a'
          },
          gray: {
            DEFAULT: "#888888",
            dark: "#444444",
          },
        },
      },
    },
  },
  plugins: [],
}