import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

export const themeOptions: ThemeOptions = {
  palette: {
    type: 'light',
    primary: {
      main: '#0E4353',
      light: '#53b1bd',
      dark: '#252b34',
    },
    secondary: {
      main: '#eaf7fc',
    },
    text: {
      primary: '#252b34',
      secondary: '#0e4353',
    },
    error: {
      main: '#bb4430',
    },
    warning: {
      main: '#f7b32b',
    },
    info: {
      main: '#00738e',
    },
    success: {
      main: '#399e5a',
    },
    divider: '#eaf7fc',
  },
};