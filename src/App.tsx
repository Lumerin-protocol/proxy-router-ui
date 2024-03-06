import { Main } from './Main';
import ReactGA from 'react-ga4';

const trackingId = 'G-TN08K48RMS';
ReactGA.initialize(trackingId);

// Root contains the main state and logic for the app
export const App = () => {
	return <Main />;
};
