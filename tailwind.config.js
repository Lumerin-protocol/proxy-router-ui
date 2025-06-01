const { colors } = require("./src/styles/styles.config");

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat, sans-serif"],
        Inter: ["Inter", "sans-serif"],
        Montserrat: ["Montserrat", "sans-serif"],
        Raleway: ["Raleway", "sans-serif"],
      },
      fontSize: {
        xxs: ".625rem",
        xs: ".8125rem",
        sm: "1rem",
        md: "1.25rem",
        lg: "1.75rem",
        xl: "2rem",
        xxl: "2.5rem",
        18: "1.125rem",
        50: "3.125rem",
      },
      colors,
      spacing: {
        50: "12.5rem",
        10: "3.25rem",
      },
      minWidth: {
        21: "21rem",
        26: "26rem",
        28: "28rem",
      },
      maxWidth: {
        32: "32rem",
        "3/4": "75%",
      },
      borderRadius: {
        5: "5px",
        10: "10px",
        15: "15px",
        20: "20px",
        30: "30px",
        50: "50px",
        120: "120px",
        "50%": "50%",
      },
      padding: {
        18: "4.5rem",
      },
      height: {
        100: "10px",
        320: "32px",
        400: "40px",
        500: "50px",
        600: "60px",
        750: "75px",
      },
      width: {
        95: "95%",
        99: "99%",
      },
      screens: {
        md: "900px",
      },
    },
  },
  variants: {
    extend: {},
  },
};
