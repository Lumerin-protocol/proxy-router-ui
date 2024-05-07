import React from 'react';
import { Main } from './components/Main';
import ReactGA from 'react-ga4';
import { ThemeProvider } from '@mui/material';
import { darkTheme } from '../styles/themeOptions';

const trackingId = 'G-TN08K48RMS';
ReactGA.initialize(trackingId);

export const App: React.FC = () => (
	<ThemeProvider theme={darkTheme}>
		<Main />
	</ThemeProvider>
);
App.displayName = 'App';
App.whyDidYouRender = false;
