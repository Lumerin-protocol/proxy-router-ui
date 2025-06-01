import createTheme from "@mui/material/styles/createTheme";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 100px #0e1c26 inset!important",
            WebkitTextFillColor: "white !important",
            caretColor: "white !important",
            transition: "background-color 9999s ease-out, color 9999s ease-out", // somehow it fixes autocomplete black input text in chrome
          },
        },
      },
    },
  },
});
