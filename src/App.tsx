import React from 'react';
import { Main } from './components/Main';
import ReactGA from 'react-ga4';

const trackingId = 'G-TN08K48RMS';
ReactGA.initialize(trackingId);

export const App: React.FC = () => <Main />;
App.displayName = 'App';
App.whyDidYouRender = false;
