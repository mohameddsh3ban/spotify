/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: 
          {dark:"#1DB954",
           light: "#1ED760" ,
           lighter: "#3be477",
          },
            
          black: "#2a2a2a",
          lightBlack: "#1f1f1f",
          shadeBlack: "#121212",
          white: "#FFFFFF",
          auth:{
            black: '#121212'

          },
          gray: {
            DEFAULT: "#B3B3B3",
            dark: "#282828",
          },
        },
      },
    },
  },
  plugins: [],
}